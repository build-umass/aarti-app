// PDF processing service for loading and parsing PDF documents
// Note: This is a simplified implementation. In a production app,
// you might want to use a more robust PDF parsing library.

export interface PDFDocument {
  filename: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export class PDFService {
  // Load PDF content from assets (pre-processed)
  // In a real implementation, you would extract text from actual PDF files
  static async loadPDFDocuments(): Promise<PDFDocument[]> {
    try {
      // For now, return mock PDF data based on the filenames provided
      // In production, you would:
      // 1. Load actual PDF files from assets or remote storage
      // 2. Extract text content using a PDF parsing library
      // 3. Return structured document data

      const pdfDocuments: PDFDocument[] = [
        {
          filename: 'Trafficking of Women and Children FAQs.docx.pdf',
          title: 'Trafficking of Women and Children FAQs',
          content: `
Human trafficking is a serious crime that involves the exploitation of individuals through force, fraud, or coercion for various purposes including sexual exploitation and forced labor.

Key points about trafficking:
- Victims can be of any age, gender, or nationality
- Traffickers use various methods to control victims including threats, debt bondage, and isolation
- Common indicators include signs of physical abuse, lack of personal documentation, and fearfulness

Legal protections under Indian law include:
- The Immoral Traffic (Prevention) Act, 1956
- Protection of Children from Sexual Offences Act, 2012
- Bonded Labour System (Abolition) Act, 1976

If you suspect trafficking:
- Contact local police immediately
- Call the national helpline: 1099 (women) or 1098 (children)
- Seek help from NGOs specializing in anti-trafficking work
          `,
          metadata: {
            category: 'human_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Stalking FAQ.docx.pdf',
          title: 'Stalking FAQ',
          content: `
Stalking is a pattern of repeated unwanted attention that causes fear or distress to the victim. It can include following, monitoring, or contacting someone repeatedly.

Types of stalking:
- Physical stalking (following in person)
- Cyberstalking (online harassment)
- Surveillance (monitoring movements)

Legal protections in India:
- Section 354D of IPC (Stalking)
- Protection of Women from Domestic Violence Act, 2005
- Information Technology Act, 2000 (for cyberstalking)

Safety measures:
- Document all incidents with dates, times, and details
- Save all communications and evidence
- Inform friends, family, and workplace
- Consider restraining orders
- Contact police if threats escalate

Emergency contacts:
- Police: 100
- Women helpline: 1091
- Cyber crime helpline: 1930
          `,
          metadata: {
            category: 'violence',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'PCPNDT FAQs.docx.pdf',
          title: 'PCPNDT FAQs',
          content: `
The Pre-Conception and Pre-Natal Diagnostic Techniques (Prohibition of Sex Selection) Act, 1994, commonly known as PCPNDT Act, prohibits sex determination and sex selection.

Key provisions:
- Prohibits determination of sex of fetus
- Prohibits advertisement of sex determination services
- Requires registration of ultrasound machines and genetic clinics
- Mandates maintenance of records

Penalties for violation:
- Imprisonment up to 5 years
- Fine up to ₹100,000
- Cancellation of medical license
- Sealing of clinic premises

Who can conduct ultrasound:
- Only registered medical practitioners
- Only for medical necessity
- Must maintain Form F records

Reporting violations:
- Contact district appropriate authority
- Call PCPNDT helpline
- File complaint with police
          `,
          metadata: {
            category: 'health_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Harassment at workplace FAQs.docx.pdf',
          title: 'Harassment at Workplace FAQs',
          content: `
Workplace harassment includes unwelcome conduct that creates a hostile work environment or interferes with work performance.

Types of harassment:
- Sexual harassment
- Discrimination based on gender, caste, religion
- Bullying and intimidation
- Retaliation for complaints

Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013:
- Defines sexual harassment comprehensively
- Requires formation of Internal Complaints Committee (ICC)
- Provides for redressal mechanism
- Protects complainants from retaliation

Filing a complaint:
- Approach Internal Complaints Committee
- Time limit: 3 months (extendable to 3 years)
- Can approach Local Complaints Committee if ICC fails
- Maintain confidentiality

Employer responsibilities:
- Form ICC with prescribed composition
- Provide safe working environment
- Display anti-harassment policies
- Train employees on prevention

Support services:
- Ministry of Women and Child Development
- State Women's Commissions
- Legal aid services
          `,
          metadata: {
            category: 'workplace_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Dowry - FAQ.docx.pdf',
          title: 'Dowry FAQ',
          content: `
Dowry is the property or valuable security given by one party to another at the time of marriage. The Dowry Prohibition Act, 1961 prohibits giving and taking of dowry.

Prohibited acts:
- Giving or taking dowry
- Demanding dowry directly or indirectly
- Advertising for dowry
- Participating in dowry-related ceremonies

What constitutes dowry:
- Cash, jewelry, furniture, appliances
- Property, vehicles
- Any valuable security
- Gifts given with marriage condition

Legal consequences:
- Imprisonment up to 5 years
- Fine up to ₹15,000 or value of dowry
- Cancellation of marriage registration

Dowry-related violence:
- Cruelty under Section 498A IPC
- Domestic violence under DV Act
- Abetment to suicide under Section 306 IPC

Protection measures:
- Register complaint with police
- Approach Protection Officer under DV Act
- Seek orders from Magistrate
- Contact women's helpline

Prevention:
- Community awareness programs
- Education about legal rights
- Economic empowerment of women
- Strict enforcement of law
          `,
          metadata: {
            category: 'marriage_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Domestic Violence FAQ.docx.pdf',
          title: 'Domestic Violence FAQ',
          content: `
The Protection of Women from Domestic Violence Act, 2005 provides civil remedies for victims of domestic violence.

Who can seek protection:
- Wife (including live-in partners)
- Female relatives of husband
- Children

Types of domestic violence:
- Physical abuse
- Sexual abuse
- Verbal and emotional abuse
- Economic abuse

Civil remedies available:
- Protection orders
- Residence orders
- Monetary relief
- Custody orders
- Compensation orders

Procedure for relief:
- File application in Magistrate's court
- No court fees required
- Can be filed in place of residence or work
- Interim orders available immediately

Implementation:
- Orders enforced by police
- Breach is criminal offense
- Penalties for non-compliance

Support services:
- One Stop Centres (Sakhi)
- Short Stay Homes
- Legal aid services
- Counseling centers

Emergency measures:
- Call police: 100
- Women helpline: 181
- Protection orders within 24 hours
          `,
          metadata: {
            category: 'domestic_violence',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Cyber Abuse FAQs.docx.pdf',
          title: 'Cyber Abuse FAQs',
          content: `
Cyber abuse involves harassment, intimidation, or threats using digital platforms and communication technologies.

Forms of cyber abuse:
- Online harassment and bullying
- Revenge porn and image-based abuse
- Cyberstalking and monitoring
- Impersonation and defamation
- Sextortion

Legal framework:
- Information Technology Act, 2000
- Indian Penal Code sections 354A, 509
- Protection of Children from Sexual Offences Act, 2012

Reporting cyber crimes:
- Cyber Crime Portal: cybercrime.gov.in
- Local police station
- Call 1930 (cyber crime helpline)

Evidence preservation:
- Take screenshots of abusive content
- Save URLs and timestamps
- Document communication logs
- Do not delete evidence

Protection measures:
- Use privacy settings on social media
- Be cautious with personal information
- Report and block abusers
- Use two-factor authentication

Support for victims:
- Cyber Crime Investigation Units
- NGO helplines
- Counseling services
- Legal assistance
          `,
          metadata: {
            category: 'cyber_crime',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Child Sexual Abuse FAQs.docx.pdf',
          title: 'Child Sexual Abuse FAQs',
          content: `
Child sexual abuse includes any sexual act or behavior with a child under 18 years of age. The Protection of Children from Sexual Offences Act, 2012 (POCSO) provides comprehensive protection.

Types of offenses:
- Penetrative sexual assault
- Sexual assault
- Sexual harassment
- Child pornography
- Abetment and attempt

Protection under POCSO:
- Presumption of guilt against accused
- Child-friendly investigation
- Speedy trial within 1 year
- Compensation for victims

Child-friendly procedures:
- Video recording of statements
- Court proceedings in camera
- No confrontation with accused
- Support persons during trial

Reporting child abuse:
- Childline: 1098
- Women and Child Development Department
- Local police or Special Juvenile Police Unit
- Online reporting at pocso.gov.in

Mandatory reporting:
- Teachers, doctors, police must report
- Failure to report is punishable
- Protection for good faith reporters

Rehabilitation and support:
- Child Welfare Committees
- Specialized adoption agencies
- Counseling and medical care
- Education continuation support

Prevention:
- Education about body safety
- Community awareness programs
- Teacher training programs
- Strict implementation of laws
          `,
          metadata: {
            category: 'child_protection',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Child Marriage FAQs.docx.pdf',
          title: 'Child Marriage FAQs',
          content: `
Child marriage is marriage where either party is under 18 years (girls) or 21 years (boys). The Prohibition of Child Marriage Act, 2006 prohibits child marriages.

Legal age of marriage:
- Girls: 18 years
- Boys: 21 years

Void and voidable marriages:
- Marriages under 18/21 are void ab initio
- Can be declared void by court
- No legal validity

Consequences:
- Penal provisions for those involved
- Cancellation of marriage
- Restitution of conjugal rights
- Maintenance and custody orders

Protection of child brides:
- Residence orders
- Maintenance orders
- Education continuation
- Protection from domestic violence

Prevention measures:
- Awareness campaigns
- Education of girls
- Economic empowerment
- Community involvement

Reporting child marriage:
- Local police or Child Marriage Prohibition Officer
- Childline: 1098
- Women and Child Development Department

Rehabilitation:
- Continuation of education
- Vocational training
- Medical and psychological support
- Legal aid services
          `,
          metadata: {
            category: 'child_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Abandonment_of_a_Woman_by_Husband_FAQs.pdf',
          title: 'Abandonment of Woman by Husband FAQs',
          content: `
Abandonment by husband is desertion without reasonable cause for a continuous period of two years. It can be grounds for divorce under Hindu Marriage Act.

Grounds for divorce:
- Desertion for 2+ years
- Cruelty
- Adultery
- Conversion to another religion
- Mental disorder
- Virulent and incurable disease

Legal remedies:
- Restitution of conjugal rights
- Judicial separation
- Divorce by mutual consent
- Contested divorce

Maintenance rights:
- Section 125 CrPC for interim maintenance
- Hindu Adoption and Maintenance Act, 1956
- Domestic Violence Act, 2005

Property rights:
- Stridhan (woman's property)
- Share in husband's property
- Maintenance as life estate
- Right to matrimonial home

Custody of children:
- Best interest of child principle
- Welfare of child paramount
- Mother's preference for young children
- Father's visitation rights

Protection from harassment:
- Domestic Violence Act orders
- Restraining orders
- Police protection
- Criminal proceedings under Section 498A

Support services:
- Legal aid clinics
- Women's courts
- Counseling centers
- NGO support
          `,
          metadata: {
            category: 'marriage_rights',
            type: 'legal_faq',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Note on Process of Filing an FIR.docx.pdf',
          title: 'Process of Filing an FIR',
          content: `
First Information Report (FIR) is the first step in criminal investigation. It can be filed by victim, witness, or any person with knowledge of cognizable offense.

What is FIR:
- First version of crime reported to police
- Recorded in prescribed format
- Basis for police investigation
- Public document under RTI

Who can file FIR:
- Victim of crime
- Witness to crime
- Any person with knowledge of crime
- Police on their own knowledge

Process of filing FIR:
- Visit nearest police station
- Provide detailed information
- FIR registered immediately
- Copy provided to complainant
- Investigation started

Contents of FIR:
- Date, time, place of occurrence
- Details of accused (if known)
- Description of offense
- Names of witnesses
- Details of property involved

Rights of complainant:
- Get copy of FIR free of cost
- Know progress of investigation
- File application for further investigation
- Approach Magistrate if police refuse

Time limits:
- FIR can be filed anytime
- No limitation for cognizable offenses
- Police must register immediately

If police refuse:
- Approach Superintendent of Police
- File complaint with Magistrate
- Approach State Human Rights Commission
- Contact DGP or Ministry of Home Affairs

Electronic FIR:
- Available in many states
- Can be filed online
- Same legal validity
- Faster processing
          `,
          metadata: {
            category: 'legal_procedures',
            type: 'legal_guide',
            jurisdiction: 'india'
          }
        },
        {
          filename: 'Note on - Property Rights of Women in Andhra Pradesh.docx.pdf',
          title: 'Property Rights of Women in Andhra Pradesh',
          content: `
Women in Andhra Pradesh have comprehensive property rights under various laws. These include inheritance, matrimonial property, and agricultural land rights.

Inheritance rights:
- Equal share with brothers in ancestral property
- Hindu Succession Act, 1956 (amended 2005)
- Agricultural Land Ceiling Act
- Rights in husband's property

Matrimonial property rights:
- Stridhan (woman's exclusive property)
- Gifts received during marriage
- Dowry articles (after prohibition)
- Separate property acquired during marriage

Agricultural land rights:
- Andhra Pradesh Land Reforms Act
- Rights through inheritance
- Assignment of government land
- Joint pattas for husband and wife

Legal aid and support:
- Andhra Pradesh State Legal Services Authority
- District Legal Services Authorities
- Free legal aid for women
- Women lawyers panels

Implementation challenges:
- Social customs and practices
- Lack of awareness
- Documentation issues
- Dispute resolution mechanisms

Government schemes:
- Land rights for women
- Property registration campaigns
- Legal literacy programs
- Financial assistance for property disputes

Protection measures:
- Domestic Violence Act orders
- Restraining orders against alienation
- Police protection during disputes
- Court-appointed commissioners

Special provisions for vulnerable women:
- Widows and divorcees
- Single women
- Women from marginalized communities
- Victims of domestic violence
          `,
          metadata: {
            category: 'property_rights',
            type: 'legal_guide',
            jurisdiction: 'andhra_pradesh'
          }
        }
      ];

      return pdfDocuments;
    } catch (error) {
      console.error('Error loading PDF documents:', error);
      throw error;
    }
  }

  // Process and chunk large documents for better embedding
  static chunkDocument(content: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const words = content.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);

      // Break if we've covered the entire content
      if (i + chunkSize >= words.length) break;
    }

    return chunks;
  }
}
