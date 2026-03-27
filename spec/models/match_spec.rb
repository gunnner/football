RSpec.describe Match, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:league) }
    it { is_expected.to belong_to(:home_team).class_name('Team') }
    it { is_expected.to belong_to(:away_team).class_name('Team') }

    it 'has many match_events' do
      is_expected.to have_many(:match_events).dependent(:destroy)
    end

    it 'has many match_statistics' do
      is_expected.to have_many(:match_statistics).dependent(:destroy)
    end

    it 'has many match_lineups' do
      is_expected.to have_many(:match_lineups).dependent(:destroy)
    end

    it 'has many box_scores' do
      is_expected.to have_many(:box_scores).dependent(:destroy)
    end

    it 'has many highlights'  do
      is_expected.to have_many(:highlights).dependent(:destroy)
    end
  end

  describe 'validations' do
    subject { build(:match) }

    it { is_expected.to validate_presence_of(:external_id) }
    it { is_expected.to validate_presence_of(:date) }
    it { is_expected.to validate_presence_of(:status) }
    it { is_expected.to validate_uniqueness_of(:external_id) }
    it { is_expected.to validate_inclusion_of(:status).in_array(Match::STATUSES) }
  end

  describe 'scopes' do
    let!(:team1) { create(:team) }
    let!(:team2) { create(:team) }
    let!(:team3) { create(:team) }

    let!(:live_match)     { create(:match, status: 'First half') }
    let!(:finished_match) { create(:match, status: 'Finished') }
    let!(:upcoming_match) { create(:match, status: 'Not started', date: 1.day.from_now) }
    let!(:h2h_match1)     { create(:match, home_team: team1, away_team: team2, status: 'Finished') }
    let!(:h2h_match2)     { create(:match, home_team: team2, away_team: team1, status: 'Finished') }
    let!(:other_match)    { create(:match, home_team: team1, away_team: team3, status: 'Finished') }

    describe '.live' do
      it 'returns live matches' do
        expect(Match.live).to     include(live_match)
        expect(Match.live).not_to include(finished_match)
      end
    end

    describe '.finished' do
      it 'returns finished matches' do
        expect(Match.finished).to     include(finished_match)
        expect(Match.finished).not_to include(live_match)
      end
    end

    describe '.upcoming' do
      it 'returns upcoming matches' do
        expect(Match.upcoming).to     include(upcoming_match)
        expect(Match.upcoming).not_to include(finished_match)
      end
    end

    describe '.h2h' do
      it 'returns matches between two teams in both directions' do
        expect(Match.h2h(team1.id, team2.id)).to     include(h2h_match1, h2h_match2)
        expect(Match.h2h(team1.id, team2.id)).not_to include(other_match)
      end
    end
  end

  describe '#teams' do
    let(:home_team) { create(:team) }
    let(:away_team) { create(:team) }
    let(:match)     { create(:match, home_team: home_team, away_team: away_team) }

    it 'returns both home and away teams' do
      expect(match.teams).to include(home_team, away_team)
    end

    it 'returns exactly two teams' do
      expect(match.teams.count).to eq(2)
    end

    it 'returns an ActiveRecord relation' do
      expect(match.teams).to be_a(ActiveRecord::Relation)
    end
  end
end
