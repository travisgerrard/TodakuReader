import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';

const Hero = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  margin-bottom: 3rem;
`;

const HeroTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const PrimaryButton = styled(Link)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
    text-decoration: none;
  }
`;

const SecondaryButton = styled(Link)`
  background-color: transparent;
  color: ${({ theme }) => theme.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  border: 2px solid ${({ theme }) => theme.primary};
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.primaryLight};
    text-decoration: none;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.primary};
`;

const FeatureTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
`;

const ExampleSection = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 3rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
`;

const ExampleTitle = styled.h2`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  text-align: center;
`;

const ExampleContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const JapaneseText = styled.div`
  line-height: 2;
  font-size: 1.2rem;
`;

const EnglishText = styled.div`
  line-height: 1.6;
`;

const HomePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  return (
    <Container>
      <Hero>
        <HeroTitle>泊書 Todaku Reader</HeroTitle>
        <HeroSubtitle>
          A personalized Japanese reading experience tailored to your level.
          Browse all stories freely or create an account to generate custom content based on your WaniKani levels, Genki chapters, and Tadoku difficulty.
        </HeroSubtitle>
        
        <ButtonGroup>
          {isAuthenticated ? (
            <PrimaryButton to="/stories/new">Create a Story</PrimaryButton>
          ) : (
            <PrimaryButton to="/login">Get Started</PrimaryButton>
          )}
          <SecondaryButton to="/stories">Browse Stories</SecondaryButton>
        </ButtonGroup>
      </Hero>
      
      <FeaturesGrid>
        <FeatureCard>
          <FeatureIcon>📚</FeatureIcon>
          <FeatureTitle>Free Access to All Stories</FeatureTitle>
          <p>
            Browse and read all stories without needing to create an account.
            Access a growing library of Japanese content suitable for various proficiency levels.
          </p>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon>✨</FeatureIcon>
          <FeatureTitle>Personalized Content</FeatureTitle>
          <p>
            Create an account to generate stories tailored to your WaniKani level and Genki textbook progress.
            Practice with content that's just right for your current abilities.
          </p>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon>🔤</FeatureIcon>
          <FeatureTitle>Furigana Support</FeatureTitle>
          <p>
            All stories come with readings for kanji (furigana), helping you
            practice reading while still learning new characters.
          </p>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureIcon>📝</FeatureIcon>
          <FeatureTitle>Vocabulary & Grammar</FeatureTitle>
          <p>
            Each story includes vocabulary breakdowns and grammar explanations
            to reinforce your learning and build comprehension.
          </p>
        </FeatureCard>
      </FeaturesGrid>
      
      <ExampleSection>
        <ExampleTitle>Sample Story</ExampleTitle>
        <ExampleContent>
          <JapaneseText className="japanese-text">
            <p>
              <ruby>私<rt>わたし</rt></ruby>の<ruby>猫<rt>ねこ</rt></ruby>
              
              <ruby>私<rt>わたし</rt></ruby>の<ruby>猫<rt>ねこ</rt></ruby>は<ruby>黒<rt>くろ</rt></ruby>くて<ruby>大<rt>おお</rt></ruby>きいです。<ruby>名前<rt>なまえ</rt></ruby>は<ruby>月<rt>つき</rt></ruby>です。<ruby>月<rt>つき</rt></ruby>は<ruby>毎日<rt>まいにち</rt></ruby><ruby>窓<rt>まど</rt></ruby>の<ruby>近<rt>ちか</rt></ruby>くで<ruby>寝<rt>ね</rt></ruby>ます。<ruby>時々<rt>ときどき</rt></ruby><ruby>外<rt>そと</rt></ruby>に<ruby>行<rt>い</rt></ruby>きたがりますが、<ruby>大<rt>たい</rt></ruby><ruby>抵<rt>てい</rt></ruby>は<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby>にいます。
            </p>
            <p>
              <ruby>月<rt>つき</rt></ruby>は<ruby>魚<rt>さかな</rt></ruby>が<ruby>大好<rt>だいす</rt></ruby>きです。<ruby>私<rt>わたし</rt></ruby>が<ruby>台所<rt>だいどころ</rt></ruby>で<ruby>魚<rt>さかな</rt></ruby>を<ruby>料理<rt>りょうり</rt></ruby>すると、すぐに<ruby>来<rt>き</rt></ruby>ます。「<ruby>食<rt>た</rt></ruby>べたい」と<ruby>言<rt>い</rt></ruby>っているようです。
            </p>
          </JapaneseText>
          
          <EnglishText>
            <h4>My Cat</h4>
            <p>
              My cat is black and big. His name is Tsuki (Moon). Tsuki sleeps near the window every day. 
              Sometimes he wants to go outside, but mostly he stays inside the house.
            </p>
            <p>
              Tsuki loves fish. When I cook fish in the kitchen, he comes right away. 
              It's as if he's saying "I want to eat."
            </p>
          </EnglishText>
        </ExampleContent>
      </ExampleSection>
    </Container>
  );
};

export default HomePage; 