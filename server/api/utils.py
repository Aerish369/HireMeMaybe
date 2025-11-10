

#! Future Algorithm for job matching



def calculate_match_score(profile, job):
    profile_skills = profile.skills.all()
    job_skills = job.required_skills.all()

    matching = profile_skills.filter(id__in=job_skills)
    if job_skills.count() == 0:
        return 0  # avoid division by zero lol

    match_score = (matching.count() / job_skills.count()) * 100
    return round(match_score, 2)
