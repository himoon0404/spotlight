export type PostCategory = "공연별" | "아티스트별" | "지역별" | "입문자" | "자유";

export const CAT_CONFIG: Record<PostCategory, { color: string; bg: string }> = {
  공연별:    { color: "#ef4444", bg: "rgba(239,68,68,0.13)" },
  아티스트별: { color: "#fbbf24", bg: "rgba(251,191,36,0.13)" },
  지역별:    { color: "#10b981", bg: "rgba(16,185,129,0.13)" },
  입문자:    { color: "#a78bfa", bg: "rgba(167,139,250,0.13)" },
  자유:      { color: "#60a5fa", bg: "rgba(96,165,250,0.13)" },
};

export interface MockComment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
}

export const MOCK_COMMENTS: Record<string, MockComment[]> = {
  "1": [
    { id: "c1", author: "뮤지컬고수", avatar: "뮤", content: "혼자 가도 전혀 이상하지 않아요! 오히려 공연에 더 집중할 수 있어서 저는 혼자 보는 게 더 좋더라고요.", time: "3분 전", likes: 12 },
    { id: "c2", author: "서울공연러", avatar: "서", content: "처음이면 좌석은 R석보다 S석 추천드려요. 가성비도 좋고 시야도 충분해요!", time: "8분 전", likes: 8 },
    { id: "c3", author: "막공덕후", avatar: "막", content: "저도 처음엔 혼공 걱정했는데 지금은 혼자 보는 게 제일 편해요. 걱정 안 하셔도 돼요 :)", time: "20분 전", likes: 5 },
  ],
  "2": [
    { id: "c1", author: "충남토박이", avatar: "충", content: "이번 주 토요일에 공주 문예회관에서 연주회 있어요! 무료 공연이고 수준급이에요.", time: "15분 전", likes: 6 },
    { id: "c2", author: "천안공연팬", avatar: "천", content: "천안 예술의전당도 이번 주 프로그램이 알차더라고요. 홈페이지 확인해보세요!", time: "40분 전", likes: 4 },
  ],
  "3": [
    { id: "c1", author: "2층전문가", avatar: "2", content: "저도 2층 끝자리였는데 생각보다 훨씬 잘 보였어요. 음향은 오히려 2층이 더 좋다는 분도 많더라고요.", time: "45분 전", likes: 15 },
    { id: "c2", author: "LG단골", avatar: "L", content: "LG아트센터 2층 C구역은 정말 추천해요. 전체 무대를 한눈에 볼 수 있어요.", time: "1시간 전", likes: 9 },
  ],
  "4": [
    { id: "c1", author: "피아노팬", avatar: "피", content: "복장은 너무 격식 차릴 필요 없고 깔끔한 캐주얼 정도면 충분해요. 마지막 곡 끝나고 박수 치면 앙코르 곡도 들을 수 있어요!", time: "30분 전", likes: 34 },
    { id: "c2", author: "클래식초보", avatar: "클", content: "이 글 덕분에 처음 다녀왔는데 너무 좋았어요. 감사합니다!", time: "1시간 전", likes: 21 },
    { id: "c3", author: "조성진팬클럽", avatar: "조", content: "1층 중앙 좌석 추천드려요. 피아노 건반도 보이고 표정도 잘 보여요.", time: "2시간 전", likes: 18 },
  ],
  "5": [
    { id: "c1", author: "연극매니아", avatar: "연", content: "저도 소극장으로 입문했는데 정말 좋은 선택이에요. 배우와 가까이서 교감할 수 있어서 감동이 배가 돼요.", time: "1시간 전", likes: 22 },
    { id: "c2", author: "대학로단골", avatar: "대", content: "대학로 소극장 중에서 산울림소극장이나 동숭아트센터 소극장관 추천해요!", time: "2시간 전", likes: 14 },
  ],
  "6": [
    { id: "c1", author: "공연후유증", avatar: "공", content: "공연 끝나고 OST 계속 듣는 게 저의 해소법이에요. 오히려 여운을 즐기는 거 같아서 좋더라고요!", time: "2시간 전", likes: 45 },
    { id: "c2", author: "감성러", avatar: "감", content: "팸플릿 꺼내서 다시 읽어보거나 관련 영상 찾아보면 여운이 더 깊어지던데요 ㅎㅎ", time: "3시간 전", likes: 38 },
    { id: "c3", author: "뮤덕", avatar: "뮤", content: "같이 본 사람이랑 카페 가서 이야기 나누는 게 최고인 것 같아요. 그게 또 공연의 묘미 아닐까요?", time: "4시간 전", likes: 29 },
  ],
  "7": [
    { id: "c1", author: "캐스팅알리미", avatar: "캐", content: "공식 인스타그램 스토리에 올라오는 경우가 많아요. 팔로우해두시면 빠르게 알 수 있어요!", time: "3시간 전", likes: 7 },
  ],
  "8": [
    { id: "c1", author: "대구공연기획자", avatar: "기", content: "저도 느껴요! 최근 대구시립극단 공연 퀄리티가 정말 많이 올라왔어요. 지역 공연 생태계가 살아나고 있는 것 같아 기쁘네요.", time: "4시간 전", likes: 23 },
  ],
  "9": [
    { id: "c1", author: "영웅이팬", avatar: "영", content: "저번에 다녀왔는데 진짜 감동이에요. 공연장 분위기가 남다르고 임영웅 씨도 팬들에게 정말 진심으로 대해줘요.", time: "5시간 전", likes: 98 },
    { id: "c2", author: "콘서트초보", avatar: "콘", content: "응원봉은 꼭 챙기세요! 현장 판매도 있지만 미리 구입해 두시면 좋아요.", time: "6시간 전", likes: 56 },
    { id: "c3", author: "1열관람객", avatar: "1", content: "좌석은 1층 중반부가 제일 좋았어요. 너무 앞이면 오히려 목 아플 수 있어요 ㅎㅎ", time: "7시간 전", likes: 41 },
  ],
  "10": [
    { id: "c1", author: "예술의전당단골", avatar: "예", content: "예술의전당 근처 우면산 둘레길 걸어서 내려오면서 카페 들르는 게 제 루틴이에요!", time: "6시간 전", likes: 19 },
    { id: "c2", author: "LG근처", avatar: "L", content: "LG아트센터 근처엔 마곡 CGV 옆 식당 거리가 좋아요. 공연 전 여유롭게 식사하기 딱이에요.", time: "7시간 전", likes: 14 },
  ],
};

export interface CommunityPost {
  id: string;
  category: PostCategory;
  title: string;
  content: string;
  author: string;
  avatar: string;
  createdAt: string;
  likes: number;
  comments: number;
  tags: string[];
  performanceId?: string;
  region?: string;
  artistName?: string;
}

export interface PopularRoom {
  id: string;
  title: string;
  description: string;
  postsCount: number;
  participantsCount: number;
  icon: string;
  accentColor: string;
  category: PostCategory;
}

export const POPULAR_ROOMS: PopularRoom[] = [
  {
    id: "trending-perf",
    title: "지금 많이 이야기되는 공연",
    description: "이번 주 가장 뜨거운 공연 이야기",
    postsCount: 142,
    participantsCount: 89,
    icon: "🎭",
    accentColor: "#ef4444",
    category: "공연별",
  },
  {
    id: "trending-artist",
    title: "오늘 많이 언급된 아티스트",
    description: "지금 팬들이 가장 많이 찾는 아티스트",
    postsCount: 98,
    participantsCount: 67,
    icon: "⭐",
    accentColor: "#fbbf24",
    category: "아티스트별",
  },
  {
    id: "local",
    title: "우리 지역 공연 이야기",
    description: "내 주변 공연장과 지역 소식",
    postsCount: 76,
    participantsCount: 45,
    icon: "📍",
    accentColor: "#10b981",
    category: "지역별",
  },
  {
    id: "beginner",
    title: "입문자 질문방",
    description: "처음이라도 편하게 물어보세요",
    postsCount: 234,
    participantsCount: 156,
    icon: "💬",
    accentColor: "#a78bfa",
    category: "입문자",
  },
];

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "1",
    category: "입문자",
    title: "뮤지컬 처음 보러 가는데 혼자 가도 괜찮을까요?",
    content: "이번에 처음으로 뮤지컬을 보러 가려고 하는데요. 혼자 가도 이상하지 않을까요? 뭔가 미리 준비해야 할 것들도 있는지 궁금해요.",
    author: "공연입문자",
    avatar: "공",
    createdAt: "5분 전",
    likes: 24,
    comments: 18,
    tags: ["뮤지컬", "입문", "혼공"],
    region: "서울",
  },
  {
    id: "2",
    category: "지역별",
    title: "충남에서 이번 주 볼만한 공연 추천해주세요",
    content: "충청남도 쪽에서 이번 주말에 볼 수 있는 공연 찾고 있어요. 연극이나 클래식 장르 다 좋아요!",
    author: "충남공연러",
    avatar: "충",
    createdAt: "23분 전",
    likes: 15,
    comments: 9,
    tags: ["충남", "주말공연", "추천"],
    region: "충남",
  },
  {
    id: "3",
    category: "공연별",
    title: "오늘 공연 2층 시야 괜찮았나요?",
    content: "오늘 LG아트센터 공연 다녀오신 분들 계신가요? 2층 끝자리였는데 생각보다 괜찮더라고요. 다음에 또 가려고요.",
    author: "시야체커",
    avatar: "시",
    createdAt: "1시간 전",
    likes: 31,
    comments: 22,
    tags: ["LG아트센터", "시야", "2층"],
    performanceId: "PF220946",
    region: "서울",
  },
  {
    id: "4",
    category: "아티스트별",
    title: "조성진 공연 처음 가는 사람을 위한 팁",
    content: "조성진 피아노 리사이틀 처음 가시는 분들을 위해 제가 경험한 것들을 정리해봤어요. 복장, 박수 타이밍, 좌석 선택 팁까지 공유해요!",
    author: "클래식매니아",
    avatar: "클",
    createdAt: "2시간 전",
    likes: 89,
    comments: 47,
    tags: ["조성진", "피아노", "클래식입문"],
    artistName: "조성진",
    region: "서울",
  },
  {
    id: "5",
    category: "입문자",
    title: "소극장 공연 입문자에게 추천하는 작품",
    content: "처음 소극장 연극 보려는 분들에게 제가 감동받았던 작품들을 추천해드려요. 러닝타임도 짧고 내용도 친근한 것들로 골랐어요.",
    author: "연극팬",
    avatar: "연",
    createdAt: "3시간 전",
    likes: 67,
    comments: 33,
    tags: ["소극장", "연극", "입문추천"],
    region: "서울",
  },
  {
    id: "6",
    category: "자유",
    title: "공연 보고 나서 여운이 너무 길어요",
    content: "어제 보고 온 공연이 자꾸 생각나서 잠도 못 자겠어요. 이런 경험 다들 있으신가요? 공연 후유증 어떻게 해소하세요?",
    author: "감성충만",
    avatar: "감",
    createdAt: "4시간 전",
    likes: 112,
    comments: 56,
    tags: ["공연후기", "여운", "감동"],
  },
  {
    id: "7",
    category: "공연별",
    title: "이번 주 뮤지컬 캐스팅 변경 있나요?",
    content: "예매한 공연인데 혹시 캐스팅 변경 소식 들으신 분 있나요? 공식 SNS에서 아직 공지가 없어서요.",
    author: "뮤지컬덕후",
    avatar: "뮤",
    createdAt: "5시간 전",
    likes: 8,
    comments: 14,
    tags: ["뮤지컬", "캐스팅", "정보공유"],
    performanceId: "PF220947",
  },
  {
    id: "8",
    category: "지역별",
    title: "대구 공연 생태계가 요즘 너무 좋아진 것 같아요",
    content: "서울에서만 볼 수 있던 공연들이 대구에도 많이 오게 됐네요. 최근 대구에서 좋은 공연 많이 보셨나요?",
    author: "대구공연팬",
    avatar: "대",
    createdAt: "6시간 전",
    likes: 45,
    comments: 28,
    tags: ["대구", "지역공연", "문화생활"],
    region: "대구",
  },
  {
    id: "9",
    category: "아티스트별",
    title: "임영웅 콘서트 다녀온 분들 후기 부탁드려요",
    content: "다음 달 콘서트 예매를 앞두고 있는데, 공연장 분위기나 좌석 선택 팁이 궁금해요. 처음 가는 거라 설레고 긴장도 되고요.",
    author: "팬심가득",
    avatar: "팬",
    createdAt: "7시간 전",
    likes: 203,
    comments: 91,
    tags: ["임영웅", "콘서트", "후기"],
    artistName: "임영웅",
    region: "서울",
  },
  {
    id: "10",
    category: "자유",
    title: "공연장 인근 맛집 공유 스레드",
    content: "공연 보기 전이나 후에 들르기 좋은 공연장 근처 맛집을 공유해요! 장소와 공연장 이름도 같이 적어주시면 좋아요.",
    author: "공연미식가",
    avatar: "맛",
    createdAt: "9시간 전",
    likes: 78,
    comments: 62,
    tags: ["맛집", "공연전후", "정보공유"],
    region: "서울",
  },
];
