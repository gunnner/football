RSpec.describe BoxScore, type: :model do
  describe 'associations' do
    it { is_expected.to belong_to(:match) }
  end

  describe 'validations' do
    subject { build(:box_score) }

    it { is_expected.to validate_presence_of(:team_external_id) }
  end

  describe 'scopes' do
    let!(:match)     { create(:match) }
    let!(:starter)   { create(:box_score, match: match, is_substitute: false, team_external_id: 553) }
    let!(:sub)       { create(:box_score, match: match, is_substitute: true,  team_external_id: 553) }
    let!(:other)     { create(:box_score, match: match, is_substitute: false, team_external_id: 999) }

    describe '.starters' do
      it 'returns only starting players' do
        expect(BoxScore.starters).to     include(starter)
        expect(BoxScore.starters).not_to include(sub)
      end
    end

    describe '.substitutes' do
      it 'returns only substitute players' do
        expect(BoxScore.substitutes).to     include(sub)
        expect(BoxScore.substitutes).not_to include(starter)
      end
    end

    describe '.for_team' do
      it 'returns box scores for specific team' do
        expect(BoxScore.for_team(553)).to     include(starter, sub)
        expect(BoxScore.for_team(553)).not_to include(other)
      end
    end
  end

  describe '.link_players!' do
    let!(:match)  { create(:match) }
    let!(:player) { create(:player, external_id: 9001) }

    it 'links box_scores that have no player_id to their player' do
      box_score = create(:box_score, match: match, player_external_id: 9001, player_id: nil)
      BoxScore.link_players!
      expect(box_score.reload.player).to eq(player)
    end

    it 'skips box_scores that already have a player_id' do
      other_player = create(:player, external_id: 9002)
      box_score = create(:box_score, match: match, player_external_id: 9001, player: other_player)
      BoxScore.link_players!
      expect(box_score.reload.player).to eq(other_player)
    end

    it 'skips box_scores with no player_external_id' do
      box_score = create(:box_score, match: match, player_external_id: nil, player_id: nil)
      BoxScore.link_players!
      expect(box_score.reload.player_id).to be_nil
    end

    it 'does not link when player does not exist' do
      box_score = create(:box_score, match: match, player_external_id: 99999, player_id: nil)
      BoxScore.link_players!
      expect(box_score.reload.player_id).to be_nil
    end
  end
end
