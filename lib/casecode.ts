import bcrypt from 'bcryptjs';

// 200-word subset of the EFF short wordlist — memorable, unambiguous characters only
const WORDS = [
  'acid','aged','also','alto','arch','area','army','aunt','auto','axis',
  'back','bail','bald','ball','band','bang','bank','barn','bash','bath',
  'beam','bean','beat','beef','bell','belt','bend','bike','bill','bird',
  'bite','bold','bolt','bond','bone','book','boom','boot','born','boss',
  'bulk','burn','bush','busy','buzz','cafe','cage','cake','call','calm',
  'camp','card','care','cart','case','cash','cast','cave','chef','chip',
  'city','clam','clap','clay','clip','club','coal','coat','code','coil',
  'cold','cork','corn','cost','crab','crew','crop','cube','curl','dart',
  'dash','data','dawn','days','deal','dean','debt','deck','deli','dell',
  'desk','dial','dice','diet','disk','dock','dome','door','dose','dove',
  'down','drag','draw','drip','drop','drum','dusk','dust','duty','each',
  'earl','earn','ease','east','edge','epic','exam','fact','fair','fall',
  'farm','fast','fate','fawn','feat','feed','feet','fell','felt','fern',
  'fest','film','find','fire','firm','fish','fist','flag','flat','flaw',
  'flea','flew','flex','flip','flock','flow','foam','fold','folk','fond',
  'font','ford','fork','form','fort','foul','fund','fuse','gale','game',
  'gang','gate','gaze','gear','gift','gild','girl','give','glad','glen',
  'glob','glow','glue','goal','goat','gold','golf','good','gown','grab',
  'gram','gray','grid','grin','grip','grow','gulf','gust','hack','hail',
];

export function generateCaseCode(): string {
  const pick = () => WORDS[Math.floor(Math.random() * WORDS.length)];
  return `${pick()}-${pick()}-${pick()}-${pick()}`;
}

export async function hashCaseCode(code: string): Promise<string> {
  return bcrypt.hash(code.toLowerCase(), 12);
}

export async function verifyCaseCode(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code.toLowerCase(), hash);
}
