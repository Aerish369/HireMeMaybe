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

    # write-only skill ids
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        write_only=True,
        source='skills',
        required=False
    )

    # writable user fields
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
        # update user
        user = instance.user
        for field in ['username', 'first_name', 'last_name', 'role']:
            value = validated_data.pop(field, None)
            if value is not None:
                setattr(user, field, value)
        user.save()

        # update skills
        skills = validated_data.pop('skills', None)
        if skills is not None:
            instance.skills.set(skills)

        # update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class JobSerializer(serializers.ModelSerializer):
    applied = serializers.SerializerMethodField()
    posted_by = serializers.IntegerField(source='posted_by.id', read_only=True)

    required_skills = SkillSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'company_name',
            'location',
            'description',
            'created_at',
            'applied',
            'posted_by',
            'required_skills',
            'is_active',
        ]
    read_only_fields = ['is_active']   
    def get_applied(self, obj):
        request = self.context.get('request')
        if not request or request.user.is_anonymous:
            return False

        return Application.objects.filter(
            job=obj,
            applicant=request.user
        ).exists()

class JobCreateSerializer(serializers.ModelSerializer):
    required_skills = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all()
    )

    class Meta:
        model = Job
        fields = [
            'title',
            'description',
            'company_name',
            'location',
            'required_skills',
            # 'is_active',
        ]

    def create(self, validated_data):
        skills = validated_data.pop('required_skills', [])
        job = Job.objects.create(**validated_data)
        job.required_skills.set(skills)
        return job

class ApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'applicant',
            'cover_letter',
            'resume',
            'applied_at'
        ]

class ApplicationCreateSerializer(serializers.ModelSerializer):
    resume = serializers.FileField(required=False)

    class Meta:
        model = Application
        fields = ['cover_letter', 'resume']

    def create(self, validated_data):
        request = self.context['request']
        job = self.context['job']

        return Application.objects.create(
            job=job,
            applicant=request.user,
            **validated_data
        )

class MyApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ['id', 'job', 'applied_at']
