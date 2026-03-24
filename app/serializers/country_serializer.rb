class CountrySerializer
  include JSONAPI::Serializer

  attributes :code, :name, :logo
end
