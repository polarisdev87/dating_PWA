import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent implements OnInit {

  title: string = 'COMMUNITY AND GUIDELINES';
  guidelines = [];
  constructor(private router: Router,
    private renderer: Renderer2) { }

  @ViewChild('downArrow', { static: false }) arrow: ElementRef;

  ngOnInit() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    this.setGuidelines();
  }

  back() {
    this.router.navigate(['options']);
  }

  setGuidelines() {
    this.guidelines = [
      { Title: "Nudity/Sexual Content", Content: "We’re not asking you to comb your hair to one side or even speak in full sentences; but please keep it classy and appropriate for public consumption. No nudity, no sexually explicit content, and don’t chronicle all of your sexual desires in your bio. Keep it clean." },
      { Title: "Harassment", Content: "Do not engage, or encourage others to engage, in any targeted abuse or harassment against any other user. This includes sending any unsolicited sexual content to your matches. Reports of stalking, threats, bullying, or intimidation, are taken very seriously." },
      { Title: "Violence and Physical Harm", Content: "We do not tolerate violent, graphic, or gory content on Xclusive, or any actions or content that advocate for or threaten violence of any sort, including threatening or promoting terrorism. Physical assault, coercion, and any acts of violence are strictly prohibited.\n\n Content that advocates for or glorifies suicide or self-harm is also not allowed. In these situations, we may take a number of steps to assist the user, including reaching out with crisis resources." },
      { Title: "Hate Speech", Content: "Any content that promotes, advocates for, or condones racism, bigotry, hatred, or violence against individuals or groups based on factors like (but not limited to) race, ethnicity, religious affiliation, disability, gender, age, national origin, sexual orientation, or gender identity is not allowed." },
      { Title: "Private Information", Content: "Don’t publicly broadcast any private information, yours or anyone else’s. This includes social security numbers, passports, passwords, financial information or unlisted contact information, such as phone numbers, email addresses, home/work address." },
      { Title: "Spam", Content: "Don’t be fake. Be real instead. Don’t use Xclusive to drive people to external websites via a link or otherwise." },
      { Title: "Promotion or Solicitation", Content: "Soliciting other users is prohibited on Xclusive. It’s fine to invite your matches to something that you’re doing, but if the purpose of your profile is to advertise your event or business, non-profit, political campaign, contest, or to conduct research, we may delete your account. While we’re excited that you’re doing a comedy show next week, please don’t use Xclusive to promote it." },
      { Title: "Prostitution and Trafficking", Content: "Promoting or advocating for commercial sexual services, human trafficking or other non-consensual sexual acts is strictly prohibited and will result in your account being banned from Xclusive." },
      { Title: "Scamming", Content: "Xclusive has a zero-tolerance policy on predatory behavior of any kind. Anyone attempting to get other users’ private information for fraudulent or illegal activity may be banned. Any user caught sharing their own financial account information (PayPal, Venmo, etc.) for the purpose of receiving money from other users may also be banned from Xclusive." },
      { Title: "Impersonation", Content: "Be yourself! Don’t pretend to be someone else.\n\nDo not impersonate, or otherwise misrepresent affiliation, connection or association with, any person or entity. This includes parody accounts. While we think your Mike Pence profile is hilarious, you aren’t Mike Pence. And if you are, what are you doing on Xclusive?" },
      { Title: "Minors", Content: "You must be 18 years of age or older to use Xclusive. As such, we do not allow images of unaccompanied minors. If you want to post photos of your children, please make sure that you are in the photo as well. If you see a profile that includes an unaccompanied minor, encourages harm to a minor, or depicts a minor in a sexual or suggestive way, please report it immediately." },
      { Title: "Copyright and Trademark Infringement", Content: "If it’s not yours, don’t post it. If your Xclusive profile includes any work that is copyrighted or trademarked by others, don’t display it, unless you are allowed to do so." },
      { Title: "Illegal Usage", Content: "Don’t use Xclusive to do anything illegal. If it’s illegal IRL, it’s illegal on Xclusive." },
      { Title: "One Person, One Account", Content: "Xclusive accounts cannot have multiple owners, so don’t create an account with your friend or significant other. Additionally, please don’t maintain multiple Xclusive accounts." },
      { Title: "Third Party Apps", Content: "The use of any apps created by anyone other than Xclusive that claim to offer our service or unlock special Xclusive features (like auto-swipers) is not allowed." },
      { Title: "Account Dormancy", Content: "Xclusive is fun to use... all the time! Use Xclusive at the lake, use Xclusive while eating cake. Use Xclusive when you’re out, use Xclusive when in doubt! But, if you don’t log in to your Xclusive account in 2 years, we may delete your account for inactivity." }
    ]
  }

  changeIcon(index) {
    const arrow = document.getElementById('downArrow' + index) as HTMLElement;
    if (arrow.classList.contains('rotate')) {
      arrow.classList.remove('rotate');
    } else {
      arrow.classList.add('rotate');
    }

  }
}
