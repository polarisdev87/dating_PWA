export const CONSTANT = {
    REGEX: {
        ALPHANUMERIC: new RegExp(/^[a-z0-9]+$/),
        NUMBER: new RegExp(/^[0-9]+$/),
        PHONENUMBER: new RegExp(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/),
        EMAIL:
            new RegExp(
                /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,9}|[0-9]{1,3})(\]?)$/
            ),
        REMOVE_BLANK_SPACE: new RegExp(/^\s+|\s+$/gm),
        COMMA_AFTER_2_DIGITS: new RegExp(/\B(?=(\d{2})+(?!\d))/g)
    },
    PAGINATION: {
        LIMIT: 10,
        MAXSIZE: 10,
        FIREBASE_MESSAGE_LIMIT: 100,
        FIREBASE_CONVERSATION_LIMIT: 50
    },
    HEIGHTS: ['<4’7” (140cm)', '4’8” (142cm)', '4’9” (145cm)', '4’10” (147cm)', '4’11” (150cm)', '5’0” (152cm)', '5’1” (155cm)', '5’2” (157cm)', '5’3” (160cm)', '5’4” (163cm)', '5’5” (165cm)', '5’6” (168cm)', '5’7” (170cm)', '5’8” (173cm)', '5’9” (175cm)', '5’10” (178cm)', '5’11” (180cm)', '6’0” (183cm)', '6’1” (185cm)', '6’2” (188cm)', '6’3” (191cm)', '6’4” (193cm)', '6’5” (196cm)', '6’6” (198cm)', '6’7” (201cm)', '6’8” (203cm)', '6’9” (206cm)', '6’10” (208cm)', '6’11” (211cm)', '7’0” (213cm)', '7’1” (216cm)', '7’2” (218cm)', '>7’3” (>220cm)'],
    ZODIACSIGNS: [
        'Aquarius',
        'Pisces',
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn'
    ],
    BODYTYPES: ['Slender', 'Average', 'Athletic', 'Thick', 'Heavy Set', 'Jacked'],
    GENDER: ['Male', 'Female'],
    CHIC_MIN_RATE: 25,
    CHIC_MAX_RATE: 49,
    COSMO_MIN_RATE: 50,
    COSMO_MAX_RATE: 99,
    CLASSY__MIN_RATE: 100,
    CLASSY__MAX_RATE: 250,
    LUXE__MIN_RATE: 251,
    DATES_STATUS: [
        'All',
        'Invited',
        'Accepted',
        'Ongoing',
        'Completed',
        'Declined',
        'Cancelled',
        'Pending'
    ],
    CHAT_EVENTS: [
        'Report User',
        'Block User',
        'Delete Conversation'
    ],
   TIMES:[
       '5:00 PM',
       '5:30 PM',
       '6:00 PM',
       '6:30 PM',
       '7:00 PM',
       '7:30 PM',
       '8:00 PM',
       '8:30 PM',
     ],
     DURATION:[
         '1 hr',
         '2 hrs',
         '3 hrs',
         '4 hrs',
         '5 hrs',
         '6 hrs',
         '7 hrs',
         '8 hrs',
    ],
    ENV: "live", // local or live
    DEFAULT_PHONENUMBER_CODE: "+1",
    CHECKOUT_MINUTES_ALLOWED: 30
};
