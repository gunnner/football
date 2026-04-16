RSpec.describe SyncPreMatchLineupsWorker do
  let(:worker)           { described_class.new }
  let(:active_league_id) { ENV.fetch('ACTIVE_LEAGUE_IDS').to_i }
  let!(:active_league)   { create(:league, external_id: active_league_id) }

  let(:sync_result) { instance_double(Interactor::Context, success?: true) }

  before do
    allow(Interactors::MatchData::SyncLineup).to receive(:call).and_return(sync_result)
    allow(CacheService::Store).to receive(:invalidate)
    allow(MatchBroadcastService).to receive(:broadcast_lineups_updated)
    allow(Sentry).to receive(:capture_exception)
  end

  describe '#perform' do
    context 'when no upcoming matches without lineups' do
      it 'skips without calling SyncLineup' do
        expect(Interactors::MatchData::SyncLineup).not_to receive(:call)
        worker.perform
      end
    end

    context 'when a match starts outside the 90-minute window' do
      before { create(:match, league: active_league, date: 2.hours.from_now, status: 'Not started') }

      it 'skips without calling SyncLineup' do
        expect(Interactors::MatchData::SyncLineup).not_to receive(:call)
        worker.perform
      end
    end

    context 'when a match already has lineups' do
      let!(:match) { create(:match, league: active_league, date: 45.minutes.from_now, status: 'Not started') }

      before { create(:match_lineup, match: match) }

      it 'skips without calling SyncLineup' do
        expect(Interactors::MatchData::SyncLineup).not_to receive(:call)
        worker.perform
      end
    end

    context 'when a match starts within 90 minutes without lineups' do
      let!(:match) { create(:match, league: active_league, date: 45.minutes.from_now, status: 'Not started') }

      it 'calls SyncLineup for the match' do
        expect(Interactors::MatchData::SyncLineup).to receive(:call).with(match: match)
        worker.perform
      end

      context 'when SyncLineup succeeds and lineups are found' do
        before do
          allow(Interactors::MatchData::SyncLineup).to receive(:call) do |args|
            create(:match_lineup, match: args[:match])
            sync_result
          end
        end

        it 'invalidates the lineup cache' do
          expect(CacheService::Store).to receive(:invalidate).with(CacheService::Keys.match_lineup(match.id))
          worker.perform
        end

        it 'invalidates the match cache' do
          expect(CacheService::Store).to receive(:invalidate).with(CacheService::Keys.match(match.id))
          worker.perform
        end

        it 'broadcasts lineups_updated' do
          expect(MatchBroadcastService).to receive(:broadcast_lineups_updated).with(match)
          worker.perform
        end
      end

      context 'when SyncLineup succeeds but no lineups are stored' do
        # API returned success but no lineup data yet (not released)
        before { allow(sync_result).to receive(:success?).and_return(true) }

        it 'does not broadcast' do
          expect(MatchBroadcastService).not_to receive(:broadcast_lineups_updated)
          worker.perform
        end

        it 'does not invalidate cache' do
          expect(CacheService::Store).not_to receive(:invalidate)
          worker.perform
        end
      end

      context 'when SyncLineup raises RateLimitError' do
        before do
          allow(Interactors::MatchData::SyncLineup).to receive(:call).and_raise(Highlightly::RateLimitError)
        end

        it 'does not raise' do
          expect { worker.perform }.not_to raise_error
        end

        it 'captures to Sentry' do
          expect(Sentry).to receive(:capture_exception).with(an_instance_of(Highlightly::RateLimitError))
          worker.perform
        end

        context 'with multiple candidate matches' do
          before { create(:match, league: active_league, date: 30.minutes.from_now, status: 'Not started') }

          it 'stops processing further matches after rate limit' do
            expect(Interactors::MatchData::SyncLineup).to receive(:call).once
            worker.perform
          end
        end
      end

      context 'when SyncLineup raises StandardError' do
        before do
          allow(Interactors::MatchData::SyncLineup).to receive(:call).and_raise(StandardError, 'network error')
        end

        it 'does not raise' do
          expect { worker.perform }.not_to raise_error
        end

        it 'captures to Sentry' do
          expect(Sentry).to receive(:capture_exception).with(an_instance_of(StandardError))
          worker.perform
        end

        context 'with multiple candidate matches' do
          let!(:second_match) { create(:match, league: active_league, date: 30.minutes.from_now, status: 'Not started') }

          it 'continues processing remaining matches' do
            expect(Interactors::MatchData::SyncLineup).to receive(:call).twice
            worker.perform
          end
        end
      end
    end

    context 'when match is in an inactive league' do
      before { create(:match, date: 45.minutes.from_now, status: 'Not started') }

      it 'skips without calling SyncLineup' do
        expect(Interactors::MatchData::SyncLineup).not_to receive(:call)
        worker.perform
      end
    end
  end
end
