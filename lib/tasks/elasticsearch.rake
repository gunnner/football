namespace :elasticsearch do
  desc 'Create indexes'
  task create_indexes: :environment do
    [ Team, Player, League ].each do |model|
      model.__elasticsearch__.create_index!(force: true)
      puts "Created index for #{model}"
    end
  end

  desc 'Index all records'
  task index_all: :environment do
    [ Team, Player, League ].each do |model|
      model.import(force: true)
      puts "Indexed #{model.count} #{model} records"
    end
  end

  desc 'recreate and reindex'
  task reindex: %w[create_indexes index_all] do
    puts 'Done'
  end
end
