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
