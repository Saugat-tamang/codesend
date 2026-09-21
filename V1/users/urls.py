from django.urls import path

from .views import (
    ChangePasswordView,
    EmailVerificationConfirmView,
    EmailVerificationRequestView,
    LoginHistoryListView,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProfileView,
    RefreshTokenView,
    RegisterView,
    RevokeAllSessionsView,
    RevokeSessionView,
    SessionListView,
)

app_name = "users"

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),

    path("sessions/", SessionListView.as_view(), name="session-list"),
    path("sessions/<int:pk>/revoke/", RevokeSessionView.as_view(), name="session-revoke"),
    path("sessions/revoke-all/", RevokeAllSessionsView.as_view(), name="session-revoke-all"),

    path("password/reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password/reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("password/change/", ChangePasswordView.as_view(), name="password-change"),

    path("email/verify/", EmailVerificationRequestView.as_view(), name="email-verify-request"),
    path("email/verify/confirm/", EmailVerificationConfirmView.as_view(), name="email-verify-confirm"),

    path("profile/", ProfileView.as_view(), name="profile"),
    path("login-history/", LoginHistoryListView.as_view(), name="login-history"),
]