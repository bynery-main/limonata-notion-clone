import html2pdf from 'html2pdf.js';

interface StudyGuide {
  content: string;
  title?: string;
}

export const generateStudyGuidePdf = async (studyGuide: StudyGuide): Promise<void> => {
  // Create a simplified version of the content
  const contentDiv = document.createElement('div');

  // Process markdown content
  const contentElement = document.createElement('div');
  contentElement.style.fontFamily = 'Urbanist, sans-serif';
  contentElement.style.lineHeight = '1.6';
  contentElement.style.wordWrap = 'break-word';
  contentElement.style.fontWeight = '300'; // Lighter text
  contentElement.style.color = '#333333'; // Slightly darker than black for better readability
  
  // Process the markdown content
  let processedContent = studyGuide.content
    // Headers
    .replace(/^#{1,6}\s+(.+)$/gm, (match, title) => {
      const level = match.trim().indexOf(' ');
      const fontSize = Math.max(28 - (level * 2), 16);
      return `<h${level} style="color: #FE7EF4; font-size: ${fontSize}px; margin-top: 20px; margin-bottom: 10px; font-family: Urbanist, sans-serif; font-weight: bold;">${title}</h${level}>`;
    })
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong style="font-weight: bold;">$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em style="font-style: italic;">$1</em>')
    // Lists
    .replace(/^\s*\*\s+(.+)$/gm, '<li style="margin-bottom: 8px; margin-left: 20px; font-weight: 300;">$1</li>')
    .replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin-bottom: 8px; margin-left: 20px; font-weight: 300;">$1</li>')
    // Code blocks
    .replace(/```(.+?)```/gs, '<pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; font-weight: normal;">$1</pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-weight: normal;">$1</code>')
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #FE7EF4; text-decoration: underline;">$1</a>')
    // Paragraphs (must come last)
    .replace(/^([^<].+)$/gm, '<p style="margin-bottom: 16px; font-weight: 300;">$1</p>');
  
  contentElement.innerHTML = processedContent;
  contentDiv.appendChild(contentElement);
  
  // Add logo container with proper centering
  const logoContainer = document.createElement('div');
  logoContainer.style.textAlign = 'center';
  logoContainer.style.marginTop = '50px'; // Increased margin
  logoContainer.style.paddingTop = '15px';
  logoContainer.style.borderTop = '1px solid #eee';
  logoContainer.style.width = '100%';
  
  // Add "Made With Love " text
  const madeWithLoveText = document.createElement('p');
  madeWithLoveText.textContent = 'Made With Love From';
  madeWithLoveText.style.textAlign = 'center';
  madeWithLoveText.style.fontSize = '12px';
  madeWithLoveText.style.color = '#666666';
  madeWithLoveText.style.marginBottom = '8px';
  madeWithLoveText.style.fontFamily = 'Urbanist, sans-serif';
  madeWithLoveText.style.fontWeight = '300';
  logoContainer.appendChild(madeWithLoveText);
  
  // Add logo image
  const logoImg = document.createElement('img');
  logoImg.src = `${window.location.origin}/Images/Black_Logo@4x.png`;
  logoImg.style.height = '30px';
  logoImg.style.margin = '0 auto';
  logoImg.style.display = 'block'; // This ensures proper centering
  
  logoContainer.appendChild(logoImg);
  contentDiv.appendChild(logoContainer);
  
  // Basic styling for the content container
  contentDiv.style.padding = '20px';
  contentDiv.style.maxWidth = '700px';
  contentDiv.style.margin = '0 auto';
  contentDiv.style.fontFamily = 'Urbanist, sans-serif';
  
  const options = {
    margin: 15,
    filename: `${studyGuide.title || 'study-guide'}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Return a promise that resolves when the PDF is generated
  return new Promise<void>((resolve, reject) => {
    html2pdf()
      .from(contentDiv)
      .set(options)
      .save()
      .then(() => resolve())
      .catch(error => reject(error));
  });
}; 