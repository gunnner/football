class PlayerProfileSerializer
  include JSONAPI::Serializer

  attributes :birth_date,
             :birth_place,
             :citizenship,
             :foot,
             :height,
             :main_position,
             :current_club,
             :joined_at,
             :contract_expiry
end
