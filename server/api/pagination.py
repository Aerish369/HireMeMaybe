from rest_framework.pagination import PageNumberPagination

class JobPagination(PageNumberPagination):
    page_size = 10                     # 10 jobs per page
    page_size_query_param = 'page_size' # allow ?page_size=20 override if needed
    max_page_size = 100