import PortfolioCard from './PortfolioCard'

function PortfolioGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No portfolio items found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      {items.map((item) => (
        <PortfolioCard
          key={item.id}
          title={item.title}
          description={item.description}
          type={item.type}
          date={item.date}
          fileUrl={item.fileUrl}
          tags={item.tags}
        />
      ))}
    </div>
  )
}

export default PortfolioGrid

