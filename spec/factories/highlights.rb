FactoryBot.define do
  factory :highlight do
    sequence(:external_id) { it }
    highlight_type         { 'VERIFIED' }
    title                  { 'Ligue 1: Lyon vs Reims' }
    description            { 'Game recap of the match.' }
    url                    { 'https://example.com/highlight/1' }
    embed_url              { 'https://example.com/embed/1' }
    img_url                { 'https://example.com/images/1.png' }
    source                 { 'youtube' }
    channel                { 'Ligue 1 Uber Eats' }

    association :match
  end
end
