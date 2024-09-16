import React, { useState } from "react";
import "../styles/FAQ.css"; // Make sure the path matches your directory

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: "What is Carbon Credit?", answer: "Carbon Credit represents the right to emit one ton of carbon dioxide or the equivalent amount of another greenhouse gas. It is a tool to incentivize companies and organizations to reduce their carbon emissions. By purchasing carbon credits, they offset their emissions, helping to mitigate the impact of global warming." },
    { question: "What is the cost of using Carbon Credits?", answer: "The cost of carbon credits can vary depending on the marketplace and the region. This can also be influenced by supply and demand factors in the marketplace where the credits are traded." },
    { question: "Who can use Carbon Credits?", answer: "Carbon credits can be used by companies, organizations, and even individuals who want to offset their carbon footprint. They are especially relevant for businesses in industries with high emissions who want to meet regulatory requirements or sustainability goals." },
    { question: "Who can do minting?", answer: "Minting of Carbon Credit NFTs is typically done by the project developers or authorized organizations who generate carbon credits. The project developer must verify the credits and convert them into an NFT for easier tracking and trading." },
    { question: "What are the benefits of using Carbon Credits?", answer: "Carbon credits incentivize emission reductions by creating a financial value for companies that reduce their emissions.They provide companies with a mechanism to meet environmental regulations and sustainability goals.They contribute to global efforts to combat climate change by reducing greenhouse gas emissions." },
    { question: "Why should I use Carbon Credit NFT Marketplace as opposed to listing a carbon credit directly on OpenSea?", answer: " The Carbon Credit NFT Marketplace is tailored specifically for trading carbon credits, offering tools and features designed to help buyers and sellers understand the value and legitimacy of the credits being traded.Credits traded on the Carbon Credit NFT Marketplace are verified, ensuring they come from legitimate carbon reduction projects.The marketplace offers seamless integration with oracles and other blockchain tools to ensure the accuracy of the data associated with the NFTs." },
    { question: "What is the benefit of having my carbon credits verified?", answer: "Verification ensures that your carbon credits are legitimate and sourced from certified carbon reduction projects. This builds trust among buyers, as they can be confident that they are purchasing valid offsets. It also helps avoid fraudulent credits and maintains the integrity of the carbon credit market." },
    { question: "Once minted into an NFT, can my carbon credits be sold outside of the blockchain?", answer: "Once carbon credits are minted into an NFT, they are traded on blockchain marketplaces. However, certain marketplaces or mechanisms might allow you to retire (or burn) your credits, removing them from circulation, ensuring they can't be resold after they've been used to offset emissions." },
    { question: "How can people find my Carbon Credit NFTs for purchase?", answer: "People can find your carbon credit NFTs on the Carbon Credit NFT Marketplace by searching for relevant projects, emission categories, or project developers. These marketplaces often feature filtering options that allow buyers to easily find carbon credits that match their needs." },
    { question: "Can companies purchase NFTs minted via Carbon Credits to offset their carbon footprints?", answer: "Yes, companies can purchase NFTs that represent carbon credits and use them to offset their carbon footprints. Once a company purchases and retires these NFTs, it helps them achieve sustainability goals and meet regulatory requirements." },




];

  const toggleAnswer = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      {faqs.map((faq, index) => (
        <div key={index} className="faq-item">
          <div
            className="faq-question"
            onClick={() => toggleAnswer(index)}
          >
            {faq.question}
          </div>
          {openIndex === index && (
            <div className="faq-answer">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FAQPage;
