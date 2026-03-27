RSpec.describe Player, type: :model do
  describe 'associations' do
    it 'has one player_profile' do
      is_expected.to have_one(:player_profile).dependent(:destroy)
    end

    it 'has many player_statistics' do
      is_expected.to have_many(:player_statistics).dependent(:destroy)
    end

    it 'has many player_transfers' do
      is_expected.to have_many(:player_transfers).dependent(:destroy)
    end

    it 'has many player_injuries' do
      is_expected.to have_many(:player_injuries).dependent(:destroy)
    end

    it 'has many player_rumours' do
      is_expected.to have_many(:player_rumours).dependent(:destroy)
    end

    it 'has many player_market_values' do
      is_expected.to have_many(:player_market_values).dependent(:destroy)
    end

    it 'has many box_scores' do
      is_expected.to have_many(:box_scores).dependent(:destroy)
    end
  end

  describe 'validations' do
    subject { build(:player) }

    it { is_expected.to validate_presence_of(:external_id) }
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_uniqueness_of(:external_id) }
  end

  describe 'normalization' do
    it 'strips whitespace from name' do
      player = build(:player, name: '  Ivan Perisic  ')
      player.valid?
      expect(player.name).to eq('Ivan Perisic')
    end
  end

  describe 'scopes' do
    describe '.in_active_leagues' do
      let(:active_league)    { create(:league, external_id: ENV['ACTIVE_LEAGUE_IDS']) }
      let(:inactive_league)  { create(:league, external_id: 99999) }
      let!(:active_player)   { create(:player) }
      let!(:inactive_player) { create(:player) }

      before do
        allow(FootballConfig).to receive(:active_league_ids).and_return([ ENV['ACTIVE_LEAGUE_IDS'] ])

        active_match   = create(:match, league: active_league)
        inactive_match = create(:match, league: inactive_league)

        create(:box_score, match: active_match,   player: active_player,   team_external_id: 1)
        create(:box_score, match: inactive_match, player: inactive_player, team_external_id: 2)
      end

      it 'returns players from active leagues' do
        expect(Player.in_active_leagues).to     include(active_player)
        expect(Player.in_active_leagues).not_to include(inactive_player)
      end

      it 'does not return duplicates when player has multiple box scores' do
        active_match2 = create(:match, league: active_league)
        create(:box_score, match: active_match2, player: active_player, team_external_id: 1)
        expect(Player.in_active_leagues.where(id: active_player.id).count).to eq(1)
      end
    end

    describe '.search_by_name' do
      let!(:perisic)  { create(:player, name: 'Ivan Perisic') }
      let!(:ronaldo)  { create(:player, name: 'Cristiano Ronaldo') }

      it 'returns players matching search query' do
        expect(Player.search_by_name('perisic')).to     include(perisic)
        expect(Player.search_by_name('perisic')).not_to include(ronaldo)
      end

      it 'is case insensitive' do
        expect(Player.search_by_name('PERISIC')).to include(perisic)
      end
    end
  end

  describe '#as_indexed_json' do
    let(:player) { create(:player, name: 'Ronaldo', full_name: 'Cristiano Ronaldo') }

    it 'returns correct structure' do
      json = player.as_indexed_json
      expect(json).to include(
        name:        'Ronaldo',
        full_name:   'Cristiano Ronaldo',
        name_exact:  'Ronaldo',
        external_id: player.external_id
      )
    end
  end
end
