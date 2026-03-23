module Searchable
  extend ActiveSupport::Concern

  included do
    include Elasticsearch::Model

    after_commit :index_document,  on: %i[create update]
    after_commit :delete_document, on: :destroy
  end

  private

  def index_document
    ElasticsearchIndexWorker.perform_async(self.class.name, id)
  end

  def delete_document
    ElasticsearchIndexWorker.perform_async(self.class.name, id, 'delete')
  end
end
