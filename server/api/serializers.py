from rest_framework import serializers

from .models import Profile, Skill, Job, Application


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class ProfileSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    class Meta: 
        model = Profile
        fields = ['id', 'user_id', 'phone', 'birth_date', 'location', 'skills', 'experience', 'education']


#! This one shows: required skills, who posted it, important fields
class JobSerializer(serializers.ModelSerializer):
    required_skills = SkillSerializer(many=True, read_only=True)
    posted_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'description', 'company_name',
            'location', 'required_skills', 'posted_by',
            'created_at'
        ]


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
            'location', 'required_skills'
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