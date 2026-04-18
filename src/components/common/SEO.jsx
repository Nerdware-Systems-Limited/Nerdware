import { useEffect } from 'react'

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  article = false 
}) => {
  const siteTitle = 'Nerdware Technologies'
  const siteUrl = 'https://nerdwaretechnologies.com'
  // const defaultImage = `${siteUrl}/images/logo.png`
  
  const pageTitle = title ? `${title} | ${siteTitle}` : siteTitle
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl
  const pageImage = image ? `${siteUrl}${image}` : null

  useEffect(() => {
    // Set document title
    document.title = pageTitle
    
    // Function to set or update meta tags
    const setMetaTag = (name, content, property = false) => {
      if (!content) return
      
      const attribute = property ? 'property' : 'name'
      let meta = document.querySelector(`meta[${attribute}="${name}"]`)
      
      if (meta) {
        meta.setAttribute('content', content)
      } else {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        meta.setAttribute('content', content)
        document.head.appendChild(meta)
      }
    }
    
    // Set canonical link
    const setCanonical = (href) => {
      let canonical = document.querySelector('link[rel="canonical"]')
      if (canonical) {
        canonical.setAttribute('href', href)
      } else {
        canonical = document.createElement('link')
        canonical.setAttribute('rel', 'canonical')
        canonical.setAttribute('href', href)
        document.head.appendChild(canonical)
      }
    }
    
    // Set all meta tags
    setMetaTag('title', pageTitle)
    setMetaTag('description', description)
    if (keywords) setMetaTag('keywords', keywords)
    setCanonical(pageUrl)
    
    // Open Graph tags
    setMetaTag('og:type', type, true)
    setMetaTag('og:url', pageUrl, true)
    setMetaTag('og:title', pageTitle, true)
    setMetaTag('og:description', description, true)
    setMetaTag('og:image', pageImage, true)
    
    // Twitter tags
    setMetaTag('twitter:card', 'summary_large_image', true)
    setMetaTag('twitter:url', pageUrl, true)
    setMetaTag('twitter:title', pageTitle, true)
    setMetaTag('twitter:description', description, true)
    setMetaTag('twitter:image', pageImage, true)
    
    // Article specific meta tags
    if (article) {
      setMetaTag('article:author', 'Nerdware Technologies', true)
      setMetaTag('article:publisher', 'https://nerdwaretechnologies.com', true)
    }
  }, [pageTitle, description, keywords, pageUrl, pageImage, type, article])

  return null
}

export default SEO