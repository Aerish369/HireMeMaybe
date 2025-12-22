from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.


class User(AbstractUser):
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  # keep username optional but unique

    ROLE_CHOICES = (
        ("employer", "Employer"),
        ("employee", "Employee"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="employee")


    def __str__(self):
        return self.get_full_name() 