using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

public class EmailService
{
    private readonly string senderEmail = "asanda16.khathide@gmail.com";
    private readonly string appPassword = "iaac dudt qwil cdjv";

    public async Task SendEmailAsync(string recipientName, string recipientEmail, string subject, string bodyContent)
    {
        try
        {
            var message = new MailMessage();
            message.From = new MailAddress(senderEmail, "Health Hive Grp-04-11");
            message.To.Add(new MailAddress(recipientEmail, recipientName));
            message.Subject = subject;

          
            string header = @"
                <div style='font-family: Arial, sans-serif; width: 600px; margin: auto; border: 1px solid #eee;'>
                    <div style='padding: 30px; font-size: 16px; line-height: 1.5;'>
                ";

            string footer = @"
                    </div>
                    <div style='background-color: #f8f8f8; padding: 30px; text-align: center; font-size: 12px; color: #888;'>
                        <p>© 2025  Health Hive. All rights reserved.</p>
                        <p>Thank Your For Using Health Hive</p>
                    </div>
                </div>
                ";

           
            string formattedBody =
             $"<p>Hi {recipientName},</p>" +

        
             "<div style='background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 24px; margin-top: 20px; margin-bottom: 20px;'>" +
             bodyContent +
             "</div>";

            // --- Combine all parts ---
            message.Body = $"{header}{formattedBody}{footer}";
            message.IsBodyHtml = true;

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.Credentials = new NetworkCredential(senderEmail, appPassword);
                smtp.EnableSsl = true;

                await smtp.SendMailAsync(message);

                Console.WriteLine("✅ Email sent successfully.");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("❌ Failed to send email:");
            Console.WriteLine($"Message: {ex.Message}");
            Console.WriteLine($"Stack Trace: {ex.StackTrace}");
        }
    }
}