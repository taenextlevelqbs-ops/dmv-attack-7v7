const schedule = [
  {
    month: "FEB",
    dates: "27–28",
    title: "Duel in the DMV",
    location: "Upper Marlboro, MD",
    type: "Tournament",
  },
  {
    month: "MAR",
    dates: "13–14",
    title: "Music City Mayhem",
    location: "Murfreesboro, TN",
    type: "Tournament",
  },
  {
    month: "MAR",
    dates: "20–21",
    title: "Football City Clash",
    location: "Rock Hill, SC",
    type: "Tournament",
  },
  {
    month: "APR",
    dates: "3–4",
    title: "Virginia Frenzy",
    location: "Gainesville, VA",
    type: "Tournament",
  },
  {
    month: "APR",
    dates: "10–11",
    title: "PA Classic",
    location: "West Bradford Township, PA",
    type: "Tournament",
  },
  {
    month: "MAY",
    dates: "1–2",
    title: "National Championship",
    location: "Indianapolis, IN",
    type: "Qualification Required",
    championship: true,
  },
];
const dates = {"Duel in the DMV": ["2027-02-27", "2027-03-01"], "Music City Mayhem": ["2027-03-13", "2027-03-15"], "Football City Clash": ["2027-03-20", "2027-03-22"], "Virginia Frenzy": ["2027-04-03", "2027-04-05"], "PA Classic": ["2027-04-10", "2027-04-12"], "National Championship": ["2027-05-01", "2027-05-03"]};
export const tournaments = schedule.map(event=>({...event,id:dates[event.title][0],start:dates[event.title][0],end:dates[event.title][1],business:"DMV Attack",source:"Current DMV 2027 organization schedule",url:"https://www.dmvattack.com/admin/schedule"}));
