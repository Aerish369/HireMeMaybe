from django.apps import apps
from django.core.mail import send_mail
from django.db.models.signals import post_save, post_delete
from django.conf import settings 
from django.dispatch import receiver 

from api.models import Profile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_profile(sender, instance, created, **kwargs):
    # Auto-create a profile when a new user is created
    if not created:
        return

    profile = Profile.objects.create(user=instance)

    # Send a welcome email
    subject = "Welcome to HireMeMaybe"
    message = "Your account has been created successfully. Thanks for joining!"

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,     # from email
        [instance.email],             # to email
        fail_silently=True,
    )



@receiver(post_delete, sender=Profile)
def deleteUser(sender, instance, **kwargs):
    '''Deletes user when the associated profile is deleted'''
    user = instance.user
    user.delete()