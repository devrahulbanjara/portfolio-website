# Setting Up EmailJS for Contact Form

To make the contact form functional and receive emails when someone submits the form, follow these steps to set up EmailJS:

## Step 1: Create an EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account
2. The free tier allows 200 emails per month, which should be sufficient for a portfolio website

## Step 2: Create an Email Service

1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Select your email provider (Gmail, Outlook, etc.)
4. Follow the authentication steps
5. Give your service a name (e.g., "portfolio-contact")
6. Note the Service ID for later use

## Step 3: Create an Email Template

1. Go to "Email Templates" in your EmailJS dashboard
2. Click "Create New Template"
3. Design your email template. Here's a simple example:

**Subject:**

```
New Contact Form Submission from {{name}}
```

**Content:**

```
You have received a new message from your portfolio website:

Name: {{name}}
Email: {{email}}
Subject: {{subject}}

Message:
{{message}}
```

4. Save the template and note the Template ID

## Step 4: Get Your Public Key

1. Go to "Account" > "API Keys"
2. Copy your Public Key

## Step 5: Configure Your Website

1. Create a `.env.local` file in the root of your project with the following content:

```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

2. Replace the placeholders with your actual EmailJS credentials:

   - `your_service_id`: The Service ID from Step 2
   - `your_template_id`: The Template ID from Step 3
   - `your_public_key`: The Public Key from Step 4

3. Alternatively, you can directly edit the `src/config/emailjs.ts` file and replace the placeholder values:

```typescript
export const emailjsConfig = {
  serviceId: "your_service_id",
  templateId: "your_template_id",
  publicKey: "your_public_key",
};
```

## Step 6: Test Your Form

1. Start your development server
2. Fill out the contact form and submit
3. Check your email to verify that you received the message

## Troubleshooting

- If you're not receiving emails, check the browser console for any error messages
- Verify that your EmailJS credentials are correct
- Make sure your email service is properly connected in the EmailJS dashboard
- Check if your email might be going to spam/junk folders
