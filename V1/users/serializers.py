from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import (User, UserProfile, LoginHistory, RefreshToken)
from django.contrib.auth.password_validation import validate_password


# =============================
# USER / PROFILE
# =============================

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model                               = UserProfile
        fields                              = ["profile_picture", "bio", "phone_number", "timezone"]


class UserSerializer(serializers.ModelSerializer):
    profile                                 = UserProfileSerializer(read_only=True)

    class Meta:
        model                               = User
        fields                              = ["id", "username", "email", "first_name", "last_name", "is_email_verified", "date_joined", "profile"]
        read_only_fields                    = ["id", "is_email_verified", "date_joined"]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model                               = UserProfile
        fields                              = ["profile_picture", "bio", "phone_number", "timezone"]


# =============================
# REGISTRATION
# =============================

class RegisterSerializer(serializers.ModelSerializer):
    password                                = serializers.CharField(write_only=True, validators=[validate_password])
    password2                               = serializers.CharField(write_only=True)

    class Meta:
        model                               = User
        fields                              = ["username", "email", "password", "password2"]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        password                            = validated_data.pop("password")
        user                                = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user)
        return user


# =============================
# LOGIN
# =============================

class LoginSerializer(serializers.Serializer):
    identifier                              = serializers.CharField(help_text="Username or email")
    password                                = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier                          = attrs.get("identifier")
        password                            = attrs.get("password")

        user = (
            User.objects.filter(email__iexact=identifier).first()
            or User.objects.filter(username__iexact=identifier).first()
        )

        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        if user.is_locked:
            raise serializers.ValidationError(f"Account is locked until {user.locked_until.isoformat()}.")

        authenticated_user                  = authenticate(username=user.username, password=password)

        if authenticated_user is None:
            user.register_failed_login()
            raise serializers.ValidationError("Invalid credentials.")

        if not authenticated_user.is_active:
            raise serializers.ValidationError("This account has been disabled.")

        attrs["user"]                       = authenticated_user
        return attrs


# =============================
# PASSWORD / EMAIL VERIFICATION
# =============================

class PasswordResetRequestSerializer(serializers.Serializer):
    email                                   = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token                                   = serializers.CharField()
    new_password                            = serializers.CharField(validators=[validate_password])


class EmailVerificationConfirmSerializer(serializers.Serializer):
    token                                   = serializers.CharField()


class ChangePasswordSerializer(serializers.Serializer):
    old_password                            = serializers.CharField()
    new_password                            = serializers.CharField(validators=[validate_password])

    def validate_old_password(self, value):
        user                                = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


# =============================
# TOKENS / SESSIONS
# =============================

class RefreshTokenRequestSerializer(serializers.Serializer):
    refresh_token                           = serializers.CharField()


class SessionSerializer(serializers.ModelSerializer):
    is_active                               = serializers.BooleanField(read_only=True)

    class Meta:
        model                               = RefreshToken
        fields                              = ["id", "jti", "device_name", "ip_address","created_at","last_used_at","expires_at","revoked_at", "is_active",]
        read_only_fields                    = fields


class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model                               = LoginHistory
        fields                              = ["id","email_or_username","login_at","logout_at","ip_address","device_name","is_successful","login_method",]
        read_only_fields                    = fields