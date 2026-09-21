import hashlib
import secrets
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


# =============================
# COMMON TIMESTAMP MODEL
# =============================

class TimeStampedModel(models.Model):
    created_at                                  = models.DateTimeField(auto_now_add=True,)
    updated_at                                  = models.DateTimeField(auto_now=True,)

    class Meta:
        abstract                                = True


# =============================
# USER
# =============================

class User(AbstractUser):
    email                                       = models.EmailField(unique=True,db_index=True,)
    is_email_verified                           = models.BooleanField(default=False,)
    failed_login_count                          = models.PositiveIntegerField(default=0,)
    locked_until                                = models.DateTimeField(blank=True,null=True,)
    created_at                                  = models.DateTimeField(auto_now_add=True,)
    updated_at                                  = models.DateTimeField(auto_now=True,)

    class Meta:
        db_table                                = "users"

    def __str__(self):
        return self.username

    @property
    def is_locked(self):
        return bool(self.locked_until and timezone.now() < self.locked_until)

    def register_failed_login(self,lock_threshold=5,lock_duration_minutes=15):
        User.objects.filter(pk=self.pk,).update(failed_login_count=models.F("failed_login_count") + 1)
        self.refresh_from_db(fields=["failed_login_count"],)
        if self.failed_login_count >= lock_threshold:
            self.locked_until                   = (timezone.now() + timezone.timedelta(minutes=lock_duration_minutes))
            self.save(update_fields=["locked_until"],)

    def reset_failed_login(self):
        if (self.failed_login_count or self.locked_until):
            self.failed_login_count             = 0
            self.locked_until                   = None
            self.save(update_fields=["failed_login_count","locked_until",])


# =============================
# USER PROFILE
# =============================

class UserProfile(TimeStampedModel):
    user                                        = models.OneToOneField(User,on_delete=models.CASCADE,related_name="profile",)
    profile_picture                             = models.ImageField(upload_to="users/profile/",blank=True,null=True,)
    bio                                         = models.TextField(blank=True,null=True,)
    phone_number                                = models.CharField(max_length=20,blank=True,null=True,)
    timezone                                    = models.CharField(max_length=100,default="Asia/Kathmandu",)

    class Meta:
        db_table                                = "user_profiles"

    def __str__(self):
        return f"{self.user.username}'s Profile"


# =============================
# LOGIN HISTORY
# =============================

class LoginHistory(models.Model):
    user                                        = models.ForeignKey(User,on_delete=models.CASCADE,related_name="login_history",blank=True,null=True,)
    email_or_username                           = models.CharField(max_length=255,db_index=True,)
    login_at                                    = models.DateTimeField(default=timezone.now,db_index=True,)
    logout_at                                   = models.DateTimeField(blank=True,null=True,)
    ip_address                                  = models.GenericIPAddressField(blank=True,null=True,)
    user_agent                                  = models.TextField(blank=True,null=True,)
    device_name                                 = models.CharField(max_length=255,blank=True,null=True,)
    is_successful                               = models.BooleanField(default=True,db_index=True,)
    login_method                                = models.CharField(max_length=50,blank=True,null=True,)

    class Meta:
        db_table                                = "login_history"
        ordering                                = ["-login_at",]
        indexes                                 = [models.Index(fields=["email_or_username","is_successful","login_at"], name="login_identity_status_idx"),]

    def __str__(self):
        status                                  = ("SUCCESS" if self.is_successful else "FAILED")

        return (f"{self.email_or_username} - {status} - {self.login_at}")


# =============================
# VERIFI- / PASSW- RESET TOKEN
# =============================

class VerificationToken(TimeStampedModel):
    class TokenType(models.TextChoices):
        EMAIL_VERIFY                            = ("email_verify", "Email Verification",)
        PASSWORD_RESET                          = ("password_reset", "Password Reset",)

    user                                        = models.ForeignKey(User,on_delete=models.CASCADE,related_name="verification_tokens",)
    token_type                                  = models.CharField(max_length=20,choices=TokenType.choices,db_index=True,)
    token_hash                                  = models.CharField(max_length=64,unique=True,)
    expires_at                                  = models.DateTimeField()
    used_at                                     = models.DateTimeField(blank=True,null=True,)

    class Meta:
        db_table                                = "verification_tokens"
        ordering                                = ["-created_at",]
        indexes = [
            models.Index(fields=["user","token_type","expires_at"], name="verification_user_type_idx"),
        ]

    def __str__(self):
        return (f"{self.get_token_type_display()} - {self.user.email}")

    
    @property
    def is_used(self):
        return self.used_at is not None

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    @property
    def is_valid(self):
        return (not self.is_used and not self.is_expired)

    @staticmethod
    def _hash(raw_token):
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    # =============================
    # TOKEN CREATION
    # =============================

    @classmethod
    def issue(cls,user,token_type,ttl_minutes=60):
        raw_token                               = secrets.token_urlsafe(32)

        instance = cls.objects.create(
            user                                = user,
            token_type                          = token_type,
            token_hash                          = cls._hash(raw_token),
            expires_at                          = (timezone.now() + timezone.timedelta(minutes=ttl_minutes)),
        )

        return instance, raw_token

    # =============================
    # TOKEN VERIFICATION
    # =============================

    @classmethod
    def verify(cls,raw_token,token_type,):
        token_hash                              = cls._hash(raw_token,)

        try:
            instance                            = cls.objects.get(token_hash=token_hash,token_type=token_type)

        except cls.DoesNotExist:
            return None

        if not instance.is_valid:
            return None

        return instance

    # =============================
    # MARK TOKEN USED
    # =============================

    def mark_used(self):
        if self.is_used:
            return

        self.used_at                            = timezone.now()
        self.save(update_fields=["used_at",])


# =============================
# JWT REFRESH TOKEN
# =============================

class RefreshToken(models.Model):
    user                                        = models.ForeignKey(User,on_delete=models.CASCADE,related_name="refresh_tokens",)
    jti                                         = models.CharField(max_length=255,unique=True,)
    token_hash                                  = models.CharField(max_length=64,)
    device_name                                 = models.CharField(max_length=255,blank=True,null=True,)
    user_agent                                  = models.TextField(blank=True,null=True,)
    ip_address                                  = models.GenericIPAddressField(blank=True,null=True,)
    created_at                                  = models.DateTimeField(auto_now_add=True,)
    last_used_at                                = models.DateTimeField(auto_now=True,)
    expires_at                                  = models.DateTimeField()
    revoked_at                                  = models.DateTimeField(blank=True,null=True,)

    class Meta:
        db_table                                = "refresh_tokens"
        ordering                                = ["-last_used_at",]
        indexes                                 = [
            models.Index(fields=["user", "revoked_at"], name="refresh_user_revoked_idx"),
            models.Index(fields=["expires_at"], name="refresh_expires_idx"),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.device_name or 'Unknown Device'}"

    # ===================
    # TOKEN STATUS
    # ===================

    @property
    def is_active(self):
        return (self.revoked_at is None and timezone.now() < self.expires_at)

    # ===================
    # TOKEN HASHING
    # ===================

    @staticmethod
    def hash_token(raw_token):
        return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    # ===================
    # TOKEN REVOCATION
    # ===================

    def revoke(self):
        if self.revoked_at is None:
            self.revoked_at                     = timezone.now()
            self.save(update_fields=["revoked_at"])