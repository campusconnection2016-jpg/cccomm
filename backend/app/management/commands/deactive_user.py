from django.core.management.base import BaseCommand
from django.utils.timezone import now, timedelta
from app.models import login, candidate_master, tests_candidates_map, tests_candidates_answers
import csv
class Command(BaseCommand):
    help = 'Deactivate users who have not logged out for 10 days'

    def handle(self, *args, **kwargs):
        # Calculate the date 10 days ago
        ten_days_ago = now() - timedelta(days=10)

        # Query users whose dtm_logout is older than 10 days and are still active
        inactive_users = login.objects.filter(dtm_logout__lte=ten_days_ago, is_active=True)

        # Update their is_active status to False
        for user in inactive_users:
            user.is_active = False
            user.save()

        # Print the result to the console
        self.stdout.write(f'{inactive_users.count()} users have been deactivated.') 