/**
 * Mock data for the application
 * Used as fallback when API calls fail or during testing
 */

// Import the mock stories data from JSON file
import mockStoriesJSON from '../data/mockStories.json';

// Mock grammar points
export const mockGrammarPoints = {
  grammar: [
    {
      id: 1,
      grammar_point: "〜てもいい / 〜でもいい",
      explanation: "It's OK to do something / You may do something",
      description: "This expression is used to give or ask for permission to do something.",
      jlpt_level: "N5",
      tadoku_level: 1,
      usage: "Attach to the て-form of a verb or です-form of a na-adjective/noun.",
      examples: [
        {
          japanese: "ここに座ってもいいですか？",
          english: "May I sit here?"
        },
        {
          japanese: "明日来なくてもいいです。",
          english: "You don't have to come tomorrow."
        }
      ],
      related_grammar: ["〜なければいけない", "〜なくてもいい"]
    },
    {
      id: 2,
      grammar_point: "〜たい",
      explanation: "Want to do something",
      description: "This expression is used to express one's desire to do something.",
      jlpt_level: "N5",
      tadoku_level: 1,
      usage: "Attach to the stem form of a verb (remove ます and add たい).",
      examples: [
        {
          japanese: "日本に行きたいです。",
          english: "I want to go to Japan."
        },
        {
          japanese: "何が食べたいですか？",
          english: "What do you want to eat?"
        }
      ],
      related_grammar: ["〜たがる", "〜ほしい"]
    },
    {
      id: 3,
      grammar_point: "〜なければならない / 〜なきゃ",
      explanation: "Must do / Have to do",
      description: "This expression is used to express obligation or necessity.",
      jlpt_level: "N4",
      tadoku_level: 2,
      usage: "Attach to the negative form of a verb (change ない to なければならない).",
      examples: [
        {
          japanese: "明日早く起きなければなりません。",
          english: "I have to wake up early tomorrow."
        },
        {
          japanese: "宿題をしなきゃ。",
          english: "I gotta do my homework. (Casual)"
        }
      ],
      related_grammar: ["〜べき", "〜てはいけない"]
    },
    {
      id: 4,
      grammar_point: "〜ている",
      explanation: "Be (in the state of) doing something / Have done something",
      description: "This expression is used to express ongoing actions or resulting states.",
      jlpt_level: "N5",
      tadoku_level: 1,
      usage: "Attach to the て-form of a verb.",
      examples: [
        {
          japanese: "今、本を読んでいます。",
          english: "I am reading a book now."
        },
        {
          japanese: "彼は結婚しています。",
          english: "He is married."
        }
      ],
      related_grammar: ["〜てある", "〜ておく"]
    },
    {
      id: 5,
      grammar_point: "〜そうだ (Appearance)",
      explanation: "Looks like / Seems like",
      description: "This expression is used to describe how something appears based on direct observation.",
      jlpt_level: "N4",
      tadoku_level: 2,
      usage: "For verbs, attach to the stem. For i-adjectives, remove the final い and add そう. For na-adjectives, attach directly.",
      examples: [
        {
          japanese: "雨が降りそうです。",
          english: "It looks like it's going to rain."
        },
        {
          japanese: "このケーキはおいしそうです。",
          english: "This cake looks delicious."
        }
      ],
      related_grammar: ["〜そうだ (Hearsay)", "〜ようだ", "〜らしい"]
    }
  ],
  pagination: {
    total: 150,
    total_pages: 30,
    current_page: 1,
    limit: 5,
    offset: 0
  }
};

// Mock stories
export const mockStories = {
  stories: [
    {
      id: 1,
      title_jp: "私の一日",
      title_en: "My Day",
      content_jp: "朝6時に起きます。朝ごはんを食べて、学校に行きます。授業は9時から3時までです。家に帰って、宿題をします。晩ごはんの後で、テレビを見ます。11時に寝ます。",
      content_en: "I wake up at 6:00. I eat breakfast and go to school. Classes are from 9:00 to 3:00. I return home and do my homework. After dinner, I watch TV. I go to bed at 11:00.",
      tadoku_level: 1,
      wanikani_max_level: 5,
      genki_max_chapter: 3,
      upvotes: 12
    },
    {
      id: 2,
      title_jp: "東京旅行",
      title_en: "Tokyo Trip",
      content_jp: "先週、東京に行きました。東京タワーと東京スカイツリーを見ました。渋谷で買い物をして、秋葉原でゲームを買いました。日本の食べ物はとてもおいしかったです。また行きたいです。",
      content_en: "Last week, I went to Tokyo. I saw Tokyo Tower and Tokyo Skytree. I went shopping in Shibuya and bought games in Akihabara. Japanese food was very delicious. I want to go again.",
      tadoku_level: 2,
      wanikani_max_level: 10,
      genki_max_chapter: 6,
      upvotes: 8
    }
  ],
  pagination: {
    total: 24,
    total_pages: 12,
    current_page: 1,
    limit: 2,
    offset: 0
  }
};

// Mock vocabulary items
export const mockVocabulary = {
  vocabulary: [
    {
      id: 1,
      word: "学校",
      reading: "がっこう",
      meaning: "school",
      jlpt_level: "N5",
      examples: [
        {
          japanese: "私は毎日学校に行きます。",
          english: "I go to school every day."
        }
      ]
    },
    {
      id: 2,
      word: "食べる",
      reading: "たべる",
      meaning: "to eat",
      jlpt_level: "N5",
      examples: [
        {
          japanese: "朝ごはんを食べました。",
          english: "I ate breakfast."
        }
      ]
    }
  ]
};

// Mock stories data to use as fallback - combine both sources
export const mockStoriesData = [
  ...mockStoriesJSON,
  {
    id: 'mock-1',
    title_jp: '私の猫',
    title_en: 'My Cat',
    content_jp: '私の猫\n\n私の猫は黒くて大きいです。名前は月です。月は毎日窓の近くで寝ます。時々外に行きたがりますが、大抵は家の中にいます。\n\n月は魚が大好きです。私が台所で魚を料理すると、すぐに来ます。「食べたい」と言っているようです。',
    content_en: 'My Cat\n\nMy cat is black and big. His name is Tsuki (Moon). Tsuki sleeps near the window every day. Sometimes he wants to go outside, but mostly he stays inside the house.\n\nTsuki loves fish. When I cook fish in the kitchen, he comes right away. It is as if he is saying "I want to eat."',
    tadoku_level: 1,
    wanikani_max_level: 10,
    genki_max_chapter: 5,
    topic: 'Daily Life',
    upvotes: 42
  },
  {
    id: 'mock-2',
    title_jp: '東京の旅行',
    title_en: 'Trip to Tokyo',
    content_jp: '東京の旅行\n\n先週、私は東京に旅行しました。東京は大きい都市です。たくさんの人がいます。\n\n私は東京タワーに行きました。とても高くて、景色がきれいでした。それから、渋谷に行きました。渋谷はとても混んでいました。',
    content_en: 'Trip to Tokyo\n\nLast week, I traveled to Tokyo. Tokyo is a big city. There are many people.\n\nI went to Tokyo Tower. It was very tall, and the view was beautiful. After that, I went to Shibuya. Shibuya was very crowded.',
    tadoku_level: 2,
    wanikani_max_level: 15,
    genki_max_chapter: 8,
    topic: 'Travel',
    upvotes: 38
  },
  {
    id: 'mock-3',
    title_jp: '美味しいラーメン',
    title_en: 'Delicious Ramen',
    content_jp: '美味しいラーメン\n\n昨日、友達と新しいラーメン屋に行きました。そのお店は駅の近くにあります。\n\n私は味噌ラーメンを食べました。とても美味しかったです。友達は塩ラーメンを注文しました。彼も満足していました。また行きたいです。',
    content_en: 'Delicious Ramen\n\nYesterday, I went to a new ramen shop with my friend. The shop is near the station.\n\nI ate miso ramen. It was very delicious. My friend ordered salt ramen. He was also satisfied. I want to go there again.',
    tadoku_level: 2,
    wanikani_max_level: 20,
    genki_max_chapter: 10,
    topic: 'Food',
    upvotes: 25
  }
];

// Function to get mock stories data with pagination and filtering
export const getMockStoriesData = (options = {}) => {
  const { 
    limit = 10, 
    offset = 0, 
    delay = 300,
    tadoku_level = '',
    wanikani_level = '',
    genki_chapter = '',
    length = '',
    topic = '',
    search = ''
  } = options;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filter stories based on search criteria
      let filteredStories = [...mockStoriesData];
      
      // Apply filters
      if (tadoku_level && tadoku_level !== 'any') {
        filteredStories = filteredStories.filter(
          story => story.tadoku_level == tadoku_level
        );
      }
      
      if (wanikani_level && wanikani_level !== 'any') {
        filteredStories = filteredStories.filter(
          story => story.wanikani_max_level <= parseInt(wanikani_level)
        );
      }
      
      if (genki_chapter && genki_chapter !== 'any') {
        filteredStories = filteredStories.filter(
          story => story.genki_max_chapter <= parseInt(genki_chapter)
        );
      }
      
      if (length && length !== 'any') {
        // Assuming length categories: short, medium, long
        const getContentLength = (content) => {
          const wordCount = content.split(/\s+/).length;
          if (wordCount < 50) return 'short';
          if (wordCount < 150) return 'medium';
          return 'long';
        };
        
        filteredStories = filteredStories.filter(
          story => getContentLength(story.content_jp) === length
        );
      }
      
      if (topic && topic !== 'any') {
        filteredStories = filteredStories.filter(
          story => story.topic === topic || 
                  story.tags?.includes(topic.toLowerCase())
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredStories = filteredStories.filter(
          story => 
            story.title_jp.toLowerCase().includes(searchLower) ||
            story.title_en.toLowerCase().includes(searchLower) ||
            story.content_jp.toLowerCase().includes(searchLower) ||
            story.content_en.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, filteredStories.length);
      const paginatedStories = filteredStories.slice(startIndex, endIndex);
      
      resolve({
        stories: paginatedStories,
        pagination: {
          total: filteredStories.length,
          limit: limit,
          offset: offset,
          hasMore: endIndex < filteredStories.length
        }
      });
    }, delay);
  });
};

// Export all mock data with a function to simulate API delay
export const getMockData = (dataType, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      switch (dataType) {
        case 'grammar':
          resolve(mockGrammarPoints);
        case 'stories':
          resolve(mockStories);
        case 'vocabulary':
          resolve(mockVocabulary);
        default:
          resolve(null);
      }
    }, delay);
  });
}; 