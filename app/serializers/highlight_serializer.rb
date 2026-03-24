class HighlightSerializer
  include JSONAPI::Serializer

  attributes :external_id,
             :highlight_type,
             :title,
             :description,
             :url,
             :embed_url,
             :img_url,
             :source,
             :channel
end
