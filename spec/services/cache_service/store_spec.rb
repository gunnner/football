RSpec.describe CacheService::Store do
  let(:key)  { 'test:key' }
  let(:data) { { 'name' => 'Football', 'count' => 42 } }

  after { CacheService::Store.invalidate(key) }

  describe '.write and .read' do
    it 'writes and reads data' do
      CacheService::Store.write(key, data, ttl: 60)
      expect(CacheService::Store.read(key)).to eq(data)
    end

    it 'returns nil for missing key' do
      expect(CacheService::Store.read('missing:key')).to be_nil
    end
  end

  describe '.fetch' do
    it 'returns cached data on second call without hitting block' do
      call_count = 0

      2.times do
        CacheService::Store.fetch(key, ttl: 60) do
          call_count += 1
          data
        end
      end

      expect(call_count).to eq(1)
    end

    it 'calls block when cache is empty' do
      result = CacheService::Store.fetch(key, ttl: 60) { data }
      expect(result).to eq(data)
    end
  end

  describe '.exists?' do
    it 'returns true when key exists' do
      CacheService::Store.write(key, data, ttl: 60)
      expect(CacheService::Store.exists?(key)).to be true
    end

    it 'returns false when key missing' do
      expect(CacheService::Store.exists?('missing:key')).to be false
    end
  end

  describe '.invalidate' do
    it 'removes key from cache' do
      CacheService::Store.write(key, data, ttl: 60)
      CacheService::Store.invalidate(key)
      expect(CacheService::Store.exists?(key)).to be false
    end
  end

  describe '.invalidate_pattern' do
    it 'removes all keys matching pattern' do
      CacheService::Store.write('test:1', data, ttl: 60)
      CacheService::Store.write('test:2', data, ttl: 60)
      CacheService::Store.write('other:1', data, ttl: 60)

      CacheService::Store.invalidate_pattern('test:*')

      expect(CacheService::Store.exists?('test:1')).to  be false
      expect(CacheService::Store.exists?('test:2')).to  be false
      expect(CacheService::Store.exists?('other:1')).to be true

      CacheService::Store.invalidate('other:1')
    end
  end
end
