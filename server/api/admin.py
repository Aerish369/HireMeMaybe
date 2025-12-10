from django.contrib import admin
<<<<<<< HEAD

# Register your models here.
=======
from . import models

admin.site.register(models.Profile)
admin.site.register(models.Skill)
admin.site.register(models.Job)
admin.site.register(models.Application)
>>>>>>> origin/main
