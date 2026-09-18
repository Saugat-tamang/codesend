from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Main user model for CodeSend.
    Handles registration, authentication, password,
    account status and Django permissions.
    """

    email                                   = models.EmailField(unique=True,db_index=True,)
    is_email_verified                       = models.BooleanField(default=False,)
    created_at                              = models.DateTimeField(auto_now_add=True,)
    updated_at                              = models.DateTimeField(auto_now=True,)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.username


class UserProfile(models.Model):
    """
    Additional information related to a user.
    """

    user                                    = models.OneToOneField(User,on_delete=models.CASCADE,related_name="profile",)
    profile_picture                         = models.ImageField(upload_to="users/profile/",blank=True,null=True,)
    bio                                     = models.TextField(blank=True,null=True,)
    phone_number                            = models.CharField(max_length=20,blank=True,null=True,)
    timezone                                = models.CharField(max_length=100,default="Asia/Kathmandu",)
    created_at                              = models.DateTimeField(auto_now_add=True,)
    updated_at                              = models.DateTimeField(auto_now=True,)

    class Meta:
        db_table = "user_profiles"

    def __str__(self):
        return f"{self.user.username}'s Profile"


class LoginHistory(models.Model):
    """
    Stores successful login/logout activity.
    Useful for security and account activity tracking.
    """

    user                                    = models.ForeignKey(User,on_delete=models.CASCADE,related_name="login_history",)
    login_at                                = models.DateTimeField(default=timezone.now,)
    logout_at                               = models.DateTimeField(blank=True,null=True,)
    ip_address                              = models.GenericIPAddressField(blank=True,null=True,)
    user_agent                              = models.TextField(blank=True,null=True,)
    device_name                             = models.CharField(max_length=255,blank=True,null=True,)
    is_successful                           = models.BooleanField(default=True,)

    class Meta:
        db_table = "login_history"
        ordering = ["-login_at"]

    def __str__(self):
        return f"{self.user.username} - {self.login_at}"


class FailedLoginAttempt(models.Model):
    """
    Tracks failed login attempts for security monitoring.
    """

    user                                    = models.ForeignKey(User,on_delete=models.CASCADE,related_name="failed_login_attempts",blank=True,null=True,)
    email_or_username                       = models.CharField(max_length=255,)
    ip_address                              = models.GenericIPAddressField(blank=True,null=True,)
    user_agent                              = models.TextField(blank=True,null=True,)
    attempted_at                            = models.DateTimeField(default=timezone.now,)

    class Meta:
        db_table = "failed_login_attempts"
        ordering = ["-attempted_at"]

    def __str__(self):
        return f"Failed login: {self.email_or_username}"


class EmailVerification(models.Model):
    """
    Stores email verification information.
    """

    user                                    = models.ForeignKey(User,on_delete=models.CASCADE,related_name="email_verifications",)
    token                                   = models.CharField(max_length=255,unique=True,)
    created_at                              = models.DateTimeField(auto_now_add=True,)
    expires_at                              = models.DateTimeField()
    verified_at                             = models.DateTimeField(blank=True,null=True,)
    is_used                                 = models.BooleanField(default=False,)

    class Meta:
        db_table = "email_verifications"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Email verification - {self.user.email}"

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at