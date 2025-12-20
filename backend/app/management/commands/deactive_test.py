from datetime import timedelta, datetime
from django.utils.timezone import now
from django.core.management.base import BaseCommand
from app.models import login, candidate_master, tests_candidates_map, tests_candidates_answers
import csv


class Command(BaseCommand):
    help = "Back up and delete data from multiple models based on deactivated student IDs"

    def handle(self, *args, **kwargs):
        try:
            self.deactivate_users()
            deactivated_student_ids = self.get_deactivated_student_ids()

            if deactivated_student_ids:
                self.backup_and_delete_data(
                    model=tests_candidates_map,
                    file_name_prefix="tests_candidates_map",
                    student_ids=deactivated_student_ids,
                    headers=[
                        'id', 'student_id', 'test_name', 'question_id', 'dtm_start', 'dtm_end', 'dtm_login', 'dtm_submit',
                        'dtm_start_test', 'status', 'attempt_count', 'is_camera_on', 'duration', 'duration_type',
                        'capture_duration', 'year', 'rules_id', 'video_required', 'is_active', 'need_candidate_info',
                        'total_score', 'avg_mark', 'is_upload_type', 'capture_passkey', 'deleted', 'created_by',
                        'dtm_created', 'modified_by', 'dtm_modified', 'remarks', 'dev_remarks', 'status'
                    ],
                )
                self.backup_and_delete_data(
                    model=tests_candidates_answers,
                    file_name_prefix="tests_candidates_answers",
                    student_ids=deactivated_student_ids,
                    headers=[
                        'id', 'student_id', 'test_name', 'question_id', 'answer', 'result',
                        'dtm_start', 'submission_compile_code', 'compile_code_editor', 'dtm_end',
                        'deleted', 'created_by', 'dtm_created', 'modified_by', 'dtm_modified',
                        'remarks', 'dev_remarks'
                    ],
                )
            else:
                self.stdout.write(self.style.WARNING("No matching student IDs found. No data to process."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred: {str(e)}"))

    def deactivate_users(self):
        ten_days_ago = now() - timedelta(days=10)
        inactive_users = login.objects.filter(dtm_login__lte=ten_days_ago, is_active=True)

        for user in inactive_users:
            print(f"Deactivating user: {user.user_name}")
            user.is_active = False
            user.save()
        print(f"Deactivated {len(inactive_users)} users.")

    def get_deactivated_student_ids(self):
        deactivated_user_names = login.objects.filter(is_active=False).values_list('user_name', flat=True)
        if not deactivated_user_names:
            return []

        return candidate_master.objects.filter(
            user_name__in=deactivated_user_names
        ).values_list('id', flat=True)

    def backup_and_delete_data(self, model, file_name_prefix, student_ids, headers):
        entries = model.objects.filter(student_id__in=student_ids)

        if not entries.exists():
            self.stdout.write(self.style.WARNING(f"No data found for {model.__name__}."))
            return

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        file_path = f'{file_name_prefix}_backup_{timestamp}.csv'

        try:
            with open(file_path, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                writer.writerow(headers)
                for entry in entries:
                    writer.writerow([getattr(entry, field, None) for field in headers])
            print(f"Backup complete: {file_path}")

            # Delete entries after successful backup
            deleted_count, _ = entries.delete()
            print(f"Deleted {deleted_count} entries from {model.__name__}.")
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted_count} entries from {model.__name__}."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Failed to back up {model.__name__}: {str(e)}"))
