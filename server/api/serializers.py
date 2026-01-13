from rest_framework import serializers

from .models import Profile, Skill, Job, Application
from user.serializers import UserSerializer


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Skill.objects.all(),
        write_only=True,
        source='skills',
        required=False
    )
    
    # Add writable user fields
    username = serializers.CharField(write_only=True, required=False)
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(
        choices=[('employer', 'Employer'), ('employee', 'Employee')],
        write_only=True,
        required=False
    )
    
    class Meta: 
        model = Profile
        fields = [
            'id', 'user', 'phone', 'birth_date', 'location', 
            'skills', 'skill_ids', 'experience', 'education',
            'username', 'first_name', 'last_name', 'role'
        ]
        
    def update(self, instance, validated_data):
        # Extract user fields
        username = validated_data.pop('username', None)
        first_name = validated_data.pop('first_name', None)
        last_name = validated_data.pop('last_name', None)
        role = validated_data.pop('role', None)
        
        # Update user if any user fields provided
        user = instance.user
        if username is not None:
            user.username = username
        if first_name is not None:
            user.first_name = first_name
        if last_name is not None:
            user.last_name = last_name
        if role is not None:
            user.role = role
        user.save()
        
        # Handle skills (ManyToMany)
        skills = validated_data.pop('skills', None)
        if skills is not None:
            instance.skills.set(skills)
        
        # Update remaining profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance
    
#! This one shows: required skills, who posted it, important fields
class JobSerializer(serializers.ModelSerializer):
    applied = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'company_name', 'location', 'description', 'created_at', 'applied'
        ]

    def get_applied(self, obj):
        request = self.context.get("request")
        if request is None or request.user.is_anonymous:
            return False

        return Application.objects.filter(
            job=obj,
            applicant=request.user
        ).exists()


#! For creating jobs, we need a write serializer too. For POST requests. 
class JobCreateSerializer(serializers.ModelSerializer):
    required_skills = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all()
    )

    class Meta:
        model = Job
        fields = [
            'title', 'description', 'company_name',
            'location', 'required_skills', 'is_active', 
        ]

    def create(self, validated_data):
        skills = validated_data.pop('required_skills', [])
        job = Job.objects.create(**validated_data)
        job.required_skills.set(skills)
        return job
    

#! Application Serializer: 
class ApplicationSerializer(serializers.ModelSerializer):
    applicant = serializers.StringRelatedField(read_only=True)
    job = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id', 'job', 'applicant', 'cover_letter', 'resume', 'applied_at'
        ]


#! When user clicks Apply: This serializer is called: 
class ApplicationCreateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)

    class Meta:
        model = Application
        fields = ['cover_letter', 'resume']

    def create(self, validated_data):
        request = self.context['request']

        job = self.context['job']  
        applicant = request.user

        return Application.objects.create(
            job=job,
            applicant=applicant,
            **validated_data
        )
        
#! New Serializer for "My Applications" feature
class MyApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'applied_at']