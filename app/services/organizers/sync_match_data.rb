module Organizers
  class SyncMatchData < Organizers::Base
    organize Interactors::MatchData::Fetch,
             Interactors::MatchData::UpdateState,
             Interactors::MatchData::SyncEvents,
             Interactors::MatchData::SyncStatistics,
             Interactors::MatchData::SyncLineup
  end
end
