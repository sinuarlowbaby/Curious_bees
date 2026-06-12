import logging
from event_scheduling.config import EMAIL_ADDRESS, EMAIL_PASSWORD, IMAP_SERVER
from event_scheduling.imap_client import fetch_unread_emails
from event_scheduling.dispatcher import process_email

logger = logging.getLogger(__name__)

def check_unread_emails():
    """Scheduled task to poll IMAP server for unread emails and process them."""
    logger.info("Background Email Check: starting check...")
    if not EMAIL_ADDRESS or not EMAIL_PASSWORD:
        logger.error("Background Email Check: EMAIL_ADDRESS or EMAIL_PASSWORD not configured.")
        return
    
    try:
        emails = fetch_unread_emails(IMAP_SERVER, EMAIL_ADDRESS, EMAIL_PASSWORD)
        if not emails:
            logger.info("Background Email Check: no unread emails found.")
        else:
            logger.info(f"Background Email Check: found {len(emails)} unread email(s).")
            for em in emails:
                try:
                    logger.info(f"Background Email Check: processing email from {em.get('sender')}")
                    process_email(em["sender"], em["receiver"], em["subject"], em["body"])
                except Exception as ex:
                    logger.error(f"Background Email Check: error processing email: {ex}", exc_info=True)
    except Exception as ex:
        logger.error(f"Background Email Check: failed to fetch/process unread emails: {ex}", exc_info=True)
    logger.info("Background Email Check: check completed.")
