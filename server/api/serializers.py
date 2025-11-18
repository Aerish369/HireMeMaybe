from rest_framework import serializers

from .models import Profile

class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField()
    class Meta: 
        model = Profile
        fields = ['id', 'user_id', 'phone', 'birth_date', 'location', 'skills', 'experience', 'education']