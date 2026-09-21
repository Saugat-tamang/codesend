import jwt
import uuid
import secrets
from django.conf import settings
from django.utils import timezone
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authentication import BaseAuthentication
from .models import LoginHistory, RefreshToken, User, VerificationToken
from rest_framework.exceptions import ValidationError as DRFValidationError

from .serializers import (
    ChangePasswordSerializer,
    EmailVerificationConfirmSerializer,
    LoginHistorySerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RefreshTokenRequestSerializer,
    RegisterSerializer,
    SessionSerializer,
    UserProfileUpdateSerializer,
    UserSerializer,
)

ACCESS_TOKEN_TTL_MINUTES                        = getattr(settings, "ACCESS_TOKEN_TTL_MINUTES", 15)
REFRESH_TOKEN_TTL_DAYS                          = getattr(settings, "REFRESH_TOKEN_TTL_DAYS", 30)


# =============================
# AUTHENTICATION CLASS
# =============================

class JWTAuthentication(BaseAuthentication):
    keyword                                     = "Bearer"

    def authenticate(self, request):
        auth_header                             = request.META.get("HTTP_AUTHORIZATION", "")
        if not auth_header.startswith(f"{self.keyword} "):
            return None

        raw_token                               = auth_header[len(self.keyword) + 1:]

        try:
            payload                             = jwt.decode(raw_token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid access token.")

        try:
            user                                = User.objects.get(pk=payload["user_id"])
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found.")

        if not user.is_active:
            raise AuthenticationFailed("This account has been disabled.")

        return (user, payload)


# =============================
# HELPERS
# =============================

def get_client_ip(request):
    forwarded                                   = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def issue_access_token(user, jti):
    payload = {
        "user_id"                               : user.id,
        "jti"                                   : jti,
        "iat"                                   : timezone.now(),
        "exp"                                   : timezone.now() + timezone.timedelta(minutes=ACCESS_TOKEN_TTL_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def issue_token_pair(user, request):
    raw_refresh_token                           = secrets.token_urlsafe(48)
    jti                                         = uuid.uuid4().hex

    refresh_token                               = RefreshToken.objects.create(
        user                                    = user,
        jti                                     = jti,
        token_hash                              = RefreshToken.hash_token(raw_refresh_token),
        device_name                             = request.META.get("HTTP_USER_AGENT", "")[:255] or None,
        user_agent                              = request.META.get("HTTP_USER_AGENT", ""),
        ip_address                              = get_client_ip(request),
        expires_at                              = timezone.now() + timezone.timedelta(days=REFRESH_TOKEN_TTL_DAYS),
    )

    access_token                                = issue_access_token(user, jti)
    return access_token, raw_refresh_token, refresh_token


def send_verification_email(user, raw_token):
    verify_url                                  = f"{getattr(settings, 'FRONTEND_URL', '')}/verify-email?token={raw_token}"
    send_mail(
        subject                                 = "Verify your email",
        message                                 = f"Click the link to verify your email: {verify_url}",
        from_email                              = getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list                          = [user.email],
        fail_silently                           = True,
    )


def send_password_reset_email(user, raw_token):
    reset_url                                   = f"{getattr(settings, 'FRONTEND_URL', '')}/reset-password?token={raw_token}"
    send_mail(
        subject                                 = "Reset your password",
        message                                 = f"Click the link to reset your password: {reset_url}",
        from_email                              = getattr(settings, "DEFAULT_FROM_EMAIL", None),
        recipient_list                          = [user.email],
        fail_silently                           = True,
    )


# =============================
# REGISTRATION
# =============================

class RegisterView(generics.CreateAPIView):
    queryset                                    = User.objects.all()
    serializer_class                            = RegisterSerializer
    permission_classes                          = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer                              = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        _, raw_token                            = VerificationToken.issue(
            user                                = user,
            token_type                          = VerificationToken.TokenType.EMAIL_VERIFY,
            ttl_minutes                         = 60 * 24,
        )
        send_verification_email(user, raw_token)

        return Response(
            {
                "user"                          : UserSerializer(user).data,
                "detail"                        : "Registration successful. Check your email to verify your account.",
            },
            status                              = status.HTTP_201_CREATED,
        )


# =============================
# LOGIN / LOGOUT / REFRESH
# =============================

class LoginView(APIView):
    permission_classes                          = [permissions.AllowAny]

    def post(self, request):
        serializer                              = LoginSerializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except DRFValidationError:
            LoginHistory.objects.create(
                user                            = None,
                email_or_username               = request.data.get("identifier", ""),
                ip_address                      = get_client_ip(request),
                user_agent                      = request.META.get("HTTP_USER_AGENT", ""),
                is_successful                   = False,
                login_method                    = "password",
            )
            raise

        user                                    = serializer.validated_data["user"]
        user.reset_failed_login()

        access_token, raw_refresh_token, _      = issue_token_pair(user, request)

        LoginHistory.objects.create(
            user                                = user,
            email_or_username                   = serializer.validated_data["identifier"],
            ip_address                          = get_client_ip(request),
            user_agent                          = request.META.get("HTTP_USER_AGENT", ""),
            is_successful                       = True,
            login_method                        = "password",
        )

        return Response(
            {
                "access_token"                  : access_token,
                "refresh_token"                 : raw_refresh_token,
                "expires_in"                    : ACCESS_TOKEN_TTL_MINUTES * 60,
                "user"                          : UserSerializer(user).data,
            },
            status                              = status.HTTP_200_OK,
        )


class RefreshTokenView(APIView):
    permission_classes                          = [permissions.AllowAny]

    def post(self, request):
        serializer                              = RefreshTokenRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_token                               = serializer.validated_data["refresh_token"]

        token_hash                              = RefreshToken.hash_token(raw_token)
        try:
            existing                            = RefreshToken.objects.select_related("user").get(token_hash=token_hash)
        except RefreshToken.DoesNotExist:
            return Response({"detail": "Invalid refresh token."}, status=status.HTTP_401_UNAUTHORIZED)

        if not existing.is_active:
            return Response(
                {"detail"                       : "Refresh token is expired or revoked."},
                status                          = status.HTTP_401_UNAUTHORIZED,
            )

        # Rotate: old refresh token is single-use.
        existing.revoke()
        access_token, new_raw_refresh_token, _  = issue_token_pair(existing.user, request)

        return Response(
            {
                "access_token"                  : access_token,
                "refresh_token"                 : new_raw_refresh_token,
                "expires_in"                    : ACCESS_TOKEN_TTL_MINUTES * 60,
            },
            status                              = status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes                          = [permissions.IsAuthenticated]

    def post(self, request):
        serializer                              = RefreshTokenRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_token                               = serializer.validated_data["refresh_token"]
        token_hash                              = RefreshToken.hash_token(raw_token)

        updated                                 = RefreshToken.objects.filter(user=request.user, token_hash=token_hash, revoked_at__isnull=True).update(revoked_at=timezone.now())

        if not updated:
            return Response(
                {"detail"                       : "Token not found or already revoked."},
                status                          = status.HTTP_404_NOT_FOUND,
            )

        return Response({"detail": "Logged out successfully."}, status=status.HTTP_200_OK)


# =============================
# SESSIONS
# =============================

class SessionListView(generics.ListAPIView):
    serializer_class                            = SessionSerializer
    permission_classes                          = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RefreshToken.objects.filter(user=self.request.user)


class RevokeSessionView(APIView):
    permission_classes                          = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            session                             = RefreshToken.objects.get(pk=pk, user=request.user)
        except RefreshToken.DoesNotExist:
            return Response({"detail": "Session not found."}, status=status.HTTP_404_NOT_FOUND)

        session.revoke()
        return Response({"detail": "Session revoked."}, status=status.HTTP_200_OK)


class RevokeAllSessionsView(APIView):
    permission_classes                          = [permissions.IsAuthenticated]

    def post(self, request):
        RefreshToken.objects.filter(user=request.user, revoked_at__isnull=True).update(revoked_at=timezone.now())
        return Response({"detail": "All sessions revoked."}, status=status.HTTP_200_OK)


# =============================
# PASSWORD RESET
# =============================

class PasswordResetRequestView(APIView):
    permission_classes                          = [permissions.AllowAny]

    def post(self, request):
        serializer                              = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email                                   = serializer.validated_data["email"]

        user                                    = User.objects.filter(email__iexact=email).first()
        if user is not None:
            _, raw_token                        = VerificationToken.issue(
                user                            = user,
                token_type                      = VerificationToken.TokenType.PASSWORD_RESET,
                ttl_minutes                     = 30,
            )
            send_password_reset_email(user, raw_token)

        return Response(
            {"detail": "If that email exists, a reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    permission_classes                          = [permissions.AllowAny]

    def post(self, request):
        serializer                              = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_instance                          = VerificationToken.verify(
            raw_token                           = serializer.validated_data["token"],
            token_type                          = VerificationToken.TokenType.PASSWORD_RESET,
        )

        if token_instance is None:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user                                    = token_instance.user
        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])
        token_instance.mark_used()

        RefreshToken.objects.filter(user=user, revoked_at__isnull=True).update(revoked_at=timezone.now())

        return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes                          = [permissions.IsAuthenticated]

    def post(self, request):
        serializer                              = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])

        RefreshToken.objects.filter(user=request.user, revoked_at__isnull=True).update(revoked_at=timezone.now())

        return Response(
            {"detail": "Password changed successfully. Please log in again."},
            status=status.HTTP_200_OK,
        )


# =============================
# EMAIL VERIFICATION
# =============================

class EmailVerificationRequestView(APIView):
    permission_classes                          = [permissions.IsAuthenticated]

    def post(self, request):
        if request.user.is_email_verified:
            return Response({"detail": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST)

        _, raw_token                            = VerificationToken.issue(
            user                                = request.user,
            token_type                          = VerificationToken.TokenType.EMAIL_VERIFY,
            ttl_minutes                         = 60 * 24,
        )
        send_verification_email(request.user, raw_token)

        return Response({"detail": "Verification email sent."}, status=status.HTTP_200_OK)


class EmailVerificationConfirmView(APIView):
    permission_classes                          = [permissions.AllowAny]

    def post(self, request):
        serializer                              = EmailVerificationConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token_instance                          = VerificationToken.verify(
            raw_token                           = serializer.validated_data["token"],
            token_type                          = VerificationToken.TokenType.EMAIL_VERIFY,
        )

        if token_instance is None:
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user                                    = token_instance.user
        user.is_email_verified                  = True
        user.save(update_fields=["is_email_verified"])
        token_instance.mark_used()

        return Response({"detail": "Email verified successfully."}, status=status.HTTP_200_OK)


# =============================
# PROFILE / LOGIN HISTORY
# =============================

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class                            = UserSerializer
    permission_classes                          = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        profile_serializer                      = UserProfileUpdateSerializer(request.user.profile, data=request.data, partial=True)
        profile_serializer.is_valid(raise_exception=True)
        profile_serializer.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class LoginHistoryListView(generics.ListAPIView):
    serializer_class                            = LoginHistorySerializer
    permission_classes                          = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LoginHistory.objects.filter(user=self.request.user)