import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.treePlantation": "Tree Plantation",
    "nav.shopTrees": "Shop Trees",
    "nav.gallery": "Gallery",
    "nav.trackRequest": "Track Request",
    "nav.contact": "Contact",
    "nav.admin": "Admin",
    "nav.myOrders": "My Orders",
    "nav.signOut": "Sign Out",
    "nav.login": "Login / Signup",
    
    // Hero Section
    "hero.title": "Building a Sustainable Future Together",
    "hero.subtitle": "Join Himsols in creating an eco-friendly environment through tree plantation, waste management, and conservation initiatives. Together, we can make a difference.",
    "hero.startPlanting": "Start Planting Trees",
    "hero.exploreServices": "Explore Services",
    "hero.ecoCertified": "Eco-Certified Organization",
    
    // Services Section
    "services.title": "Our Services",
    "services.subtitle": "Comprehensive eco-sustainability solutions designed for rural communities",
    "services.treePlantation": "Tree Plantation Services",
    "services.treePlantationDesc": "We facilitate large-scale tree plantation drives in rural and urban areas. Our team helps you select native species, provides planting guidance, and ensures proper maintenance.",
    "services.wasteManagement": "Valuable Scrap Collection",
    "services.wasteManagementDesc": "Turn your scrap into value! We collect all types of valuable scrap materials from your doorstep. Get fair prices for metals, e-waste, paper, plastics, and more.",
    "services.conservation": "Conservation Guidance",
    "services.conservationDesc": "Expert consultation on environmental conservation practices, sustainable living, and ecosystem preservation. We provide educational resources and practical solutions.",
    "services.ecoEvents": "Eco-Events Registration",
    "services.ecoEventsDesc": "Join our community events focused on environmental awareness, plantation drives, cleanup campaigns, and sustainability workshops. Make a difference together.",
    "services.getStarted": "Get Started",
    "services.readyToMakeDifference": "Ready to Make a Difference?",
    "services.contactUsToday": "Contact us today to learn more about our services and how we can help your community achieve sustainability goals.",
    "services.startPlanting": "Start Planting",
    
    // Services Features
    "services.feature.nativeSpecies": "Native species selection",
    "services.feature.plantingGuidance": "Professional planting guidance",
    "services.feature.postCare": "Post-plantation care",
    "services.feature.communityPrograms": "Community involvement programs",
    "services.feature.freePickup": "Free door-to-door pickup",
    "services.feature.bestPrices": "Best market prices",
    "services.feature.allScrapTypes": "All scrap types accepted",
    "services.feature.ecoRecycling": "Eco-friendly recycling",
    "services.feature.envAudits": "Environmental audits",
    "services.feature.sustainableTraining": "Sustainable practices training",
    "services.feature.resourceTips": "Resource conservation tips",
    "services.feature.biodiversity": "Biodiversity protection",
    "services.feature.monthlyDrives": "Monthly plantation drives",
    "services.feature.cleanupCampaigns": "Cleanup campaigns",
    "services.feature.eduWorkshops": "Educational workshops",
    "services.feature.networking": "Community networking",
    "services.villageGreening": "Village Greening Programs",
    "services.villageGreeningDesc": "Structured village-level greening campaigns connecting CSR partners, local nurseries, and farmers. We enable long-term environmental programs with digital tracking and survival monitoring.",
    "services.feature.villageCampaigns": "Village-level campaign registration",
    "services.feature.nurseryPartners": "Verified local nursery partnerships",
    "services.feature.survivalTracking": "Post-plantation survival tracking",
    "services.feature.impactDashboard": "Digital impact dashboards for CSR",
    
    // Stats Section
    "stats.treesPlanted": "Trees Planted",
    "stats.users": "Users",
    "stats.panchayatsServed": "Panchayats Served",
    
    // Mission Section
    "mission.title": "Our Mission",
    "mission.description": "To create a sustainable ecosystem by empowering rural communities with eco-friendly solutions, promoting conservation, and fostering environmental awareness for future generations.",
    "mission.learnMore": "Learn More About Us",
    
    // CTA Section
    "cta.title": "Join Our Community",
    "cta.description": "Become part of the Himsols family and contribute to building a greener, more sustainable future for everyone.",
    "cta.getStarted": "Get Started Today",
    
    // Footer
    "footer.tagline": "Building a sustainable future through eco-friendly initiatives and community empowerment.",
    "footer.quickLinks": "Quick Links",
    "footer.contact": "Contact",
    "footer.followUs": "Follow Us",
    "footer.rights": "All rights reserved.",
    
    // Common
    "common.loading": "Loading...",
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.name": "Name",
    "common.fullName": "Full Name",
    "common.email": "Email",
    "common.phone": "Phone",
    "common.phoneNumber": "Phone Number",
    "common.address": "Address",
    "common.message": "Message",
    "common.date": "Date",
    "common.quantity": "Quantity",
    "common.price": "Price",
    "common.total": "Total",
    "common.state": "State",
    "common.district": "District",
    "common.selectState": "Select State",
    "common.selectDistrict": "Select District",
    "common.allCategories": "All Categories",
    "common.showing": "Showing",
    "common.trees": "trees",
    "common.tree": "tree",
    "common.inStock": "in stock",
    "common.onlyLeft": "Only {count} left",
    "common.growth": "Growth",
    "common.height": "Height",
    "common.workingHours": "Working Hours",
    "common.monSat": "Monday - Saturday: 9:00 AM - 6:00 PM",
    "common.sunClosed": "Sunday: Closed",
    
    // Tree Plantation Page
    "plantation.title": "Tree Plantation Program",
    "plantation.subtitle": "Join us in our mission to plant 1 million trees. Every tree makes a difference in creating a greener, healthier planet.",
    "plantation.requestTitle": "Request Tree Plantation",
    "plantation.treeType": "Preferred Tree Type",
    "plantation.selectTreeType": "Select tree type",
    "plantation.location": "Location",
    "plantation.locationPlaceholder": "Village/City, District",
    "plantation.numberOfTrees": "Number of Trees",
    "plantation.additionalInfo": "Additional Information",
    "plantation.additionalPlaceholder": "Tell us about your plantation area, any specific requirements...",
    "plantation.submitRequest": "Submit Request",
    "plantation.submitting": "Submitting...",
    "plantation.requestSuccess": "Your request has been submitted successfully!",
    "plantation.authRequired": "Authentication Required",
    "plantation.pleaseLogin": "Please login to submit a tree plantation request.",
    "plantation.whyPlant": "Why Plant Trees?",
    "plantation.climateAction": "Climate Action",
    "plantation.climateDesc": "Trees absorb CO2 and produce oxygen, helping combat climate change",
    "plantation.waterConservation": "Water Conservation",
    "plantation.waterDesc": "Trees help maintain water cycle and prevent soil erosion",
    "plantation.biodiversity": "Biodiversity",
    "plantation.biodiversityDesc": "Trees provide habitat for countless species of wildlife",
    "plantation.nativeSpecies": "Native Tree Species",
    "plantation.deodar": "Deodar (Cedar)",
    "plantation.deodarDesc": "Native Himalayan species, excellent for high altitudes",
    "plantation.oak": "Oak",
    "plantation.oakDesc": "Strong and long-lived, great for wildlife",
    "plantation.pine": "Pine",
    "plantation.pineDesc": "Fast-growing, ideal for soil conservation",
    "plantation.rhododendron": "Rhododendron",
    "plantation.rhododendronDesc": "State flower of Himachal, beautiful blooms",
    "plantation.mixed": "Mixed Species",
    
    // Shop Page
    "shop.title": "Shop Trees",
    "shop.subtitle": "Choose from our selection of native tree species and contribute to a greener planet.",
    "shop.searchPlaceholder": "Search trees...",
    "shop.noTrees": "No trees available at the moment.",
    "shop.noMatch": "No trees match your search.",
    "shop.addToCart": "Add to Cart",
    "shop.outOfStock": "Out of Stock",
    "shop.addedToCart": "Added to Cart",
    "shop.addedToCartDesc": "{name} added to your cart.",
    
    // Cart
    "cart.title": "Shopping Cart",
    "cart.empty": "Your cart is empty",
    "cart.checkout": "Proceed to Checkout",
    "cart.deliveryLocation": "Delivery Location",
    "cart.notes": "Additional Notes",
    "cart.placeOrder": "Place Order",
    
    // Track Request
    "track.title": "Track Your Request",
    "track.enterTrackingId": "Enter your tracking ID",
    "track.search": "Search",
    "track.noResults": "No request found with this tracking ID",
    
    // Contact Page
    "contact.title": "Contact Us",
    "contact.subtitle": "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
    "contact.getInTouch": "Get in Touch",
    "contact.description": "We're here to help and answer any questions you might have. We look forward to hearing from you!",
    "contact.subject": "Subject",
    "contact.sendMessage": "Send Message",
    "contact.sendUsMessage": "Send us a Message",
    "contact.tellUsHelp": "Tell us how we can help...",
    "contact.messageSent": "Message Sent!",
    "contact.messageSuccess": "We'll get back to you within 24 hours.",
    
    // Auth
    "auth.login": "Login",
    "auth.signup": "Sign Up",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.fullName": "Full Name",
    "auth.forgotPassword": "Forgot Password?",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    
    // Waste Management
    "waste.title": "Valuable Scrap Collection",
    "waste.subtitle": "Schedule a pickup for your valuable scrap materials",
    "waste.wasteType": "Scrap Type",
    "waste.pickupDate": "Pickup Date",
    "waste.estimatedQuantity": "Estimated Quantity",
    "waste.requestSuccess": "Your scrap collection request has been submitted!",
    
    // Language Toggle
    "language.toggle": "हिंदी",
  },
  hi: {
    // Navbar
    "nav.home": "होम",
    "nav.services": "सेवाएं",
    "nav.treePlantation": "वृक्षारोपण",
    "nav.shopTrees": "पेड़ खरीदें",
    "nav.gallery": "गैलरी",
    "nav.trackRequest": "अनुरोध ट्रैक करें",
    "nav.contact": "संपर्क",
    "nav.admin": "एडमिन",
    "nav.myOrders": "मेरे ऑर्डर",
    "nav.signOut": "लॉग आउट",
    "nav.login": "लॉगिन / साइन अप",
    
    // Hero Section
    "hero.title": "साथ मिलकर बनाएं टिकाऊ भविष्य",
    "hero.subtitle": "हिमसोल्स के साथ वृक्षारोपण, कचरा प्रबंधन और संरक्षण पहल के माध्यम से पर्यावरण-अनुकूल वातावरण बनाने में शामिल हों। साथ मिलकर हम बदलाव ला सकते हैं।",
    "hero.startPlanting": "पेड़ लगाना शुरू करें",
    "hero.exploreServices": "सेवाएं देखें",
    "hero.ecoCertified": "इको-प्रमाणित संगठन",
    
    // Services Section
    "services.title": "हमारी सेवाएं",
    "services.subtitle": "ग्रामीण समुदायों के लिए डिज़ाइन किए गए व्यापक पर्यावरण-अनुकूल समाधान",
    "services.treePlantation": "वृक्षारोपण सेवाएं",
    "services.treePlantationDesc": "हम ग्रामीण और शहरी क्षेत्रों में बड़े पैमाने पर वृक्षारोपण अभियान की सुविधा प्रदान करते हैं। हमारी टीम देशी प्रजातियों के चयन, रोपण मार्गदर्शन और उचित रखरखाव में मदद करती है।",
    "services.wasteManagement": "मूल्यवान स्क्रैप संग्रहण",
    "services.wasteManagementDesc": "अपने स्क्रैप को मूल्य में बदलें! हम आपके दरवाजे से सभी प्रकार की मूल्यवान स्क्रैप सामग्री एकत्र करते हैं। धातु, ई-कचरा, कागज, प्लास्टिक और बहुत कुछ के लिए उचित मूल्य प्राप्त करें।",
    "services.conservation": "संरक्षण मार्गदर्शन",
    "services.conservationDesc": "पर्यावरण संरक्षण प्रथाओं, टिकाऊ जीवन और पारिस्थितिकी तंत्र संरक्षण पर विशेषज्ञ परामर्श। हम शैक्षिक संसाधन और व्यावहारिक समाधान प्रदान करते हैं।",
    "services.ecoEvents": "इको-इवेंट पंजीकरण",
    "services.ecoEventsDesc": "पर्यावरण जागरूकता, वृक्षारोपण अभियान, सफाई अभियान और स्थिरता कार्यशालाओं पर केंद्रित हमारे सामुदायिक कार्यक्रमों में शामिल हों।",
    "services.getStarted": "शुरू करें",
    "services.readyToMakeDifference": "बदलाव लाने के लिए तैयार हैं?",
    "services.contactUsToday": "हमारी सेवाओं के बारे में अधिक जानने के लिए आज ही हमसे संपर्क करें।",
    "services.startPlanting": "वृक्षारोपण शुरू करें",
    
    // Services Features
    "services.feature.nativeSpecies": "देशी प्रजातियों का चयन",
    "services.feature.plantingGuidance": "पेशेवर रोपण मार्गदर्शन",
    "services.feature.postCare": "वृक्षारोपण के बाद देखभाल",
    "services.feature.communityPrograms": "सामुदायिक भागीदारी कार्यक्रम",
    "services.feature.freePickup": "मुफ्त घर-घर पिकअप",
    "services.feature.bestPrices": "सर्वश्रेष्ठ बाजार मूल्य",
    "services.feature.allScrapTypes": "सभी प्रकार का स्क्रैप स्वीकार्य",
    "services.feature.ecoRecycling": "पर्यावरण-अनुकूल पुनर्चक्रण",
    "services.feature.envAudits": "पर्यावरण ऑडिट",
    "services.feature.sustainableTraining": "टिकाऊ प्रथाओं का प्रशिक्षण",
    "services.feature.resourceTips": "संसाधन संरक्षण युक्तियां",
    "services.feature.biodiversity": "जैव विविधता संरक्षण",
    "services.feature.monthlyDrives": "मासिक वृक्षारोपण अभियान",
    "services.feature.cleanupCampaigns": "सफाई अभियान",
    "services.feature.eduWorkshops": "शैक्षिक कार्यशालाएं",
    "services.feature.networking": "सामुदायिक नेटवर्किंग",
    "services.villageGreening": "ग्राम हरियाली कार्यक्रम",
    "services.villageGreeningDesc": "CSR भागीदारों, स्थानीय नर्सरी और किसानों को जोड़ने वाले संरचित गांव-स्तरीय हरियाली अभियान। डिजिटल ट्रैकिंग और जीवित रहने की निगरानी के साथ दीर्घकालिक पर्यावरण कार्यक्रम।",
    "services.feature.villageCampaigns": "गांव-स्तरीय अभियान पंजीकरण",
    "services.feature.nurseryPartners": "सत्यापित स्थानीय नर्सरी साझेदारी",
    "services.feature.survivalTracking": "वृक्षारोपण के बाद जीवित रहने की ट्रैकिंग",
    "services.feature.impactDashboard": "CSR के लिए डिजिटल प्रभाव डैशबोर्ड",
    
    // Stats Section
    "stats.treesPlanted": "पेड़ लगाए गए",
    "stats.users": "उपयोगकर्ता",
    "stats.panchayatsServed": "पंचायतों में सेवा",
    
    // Mission Section
    "mission.title": "हमारा मिशन",
    "mission.description": "ग्रामीण समुदायों को पर्यावरण-अनुकूल समाधानों के साथ सशक्त बनाकर, संरक्षण को बढ़ावा देकर और आने वाली पीढ़ियों के लिए पर्यावरण जागरूकता को बढ़ावा देकर एक टिकाऊ पारिस्थितिकी तंत्र बनाना।",
    "mission.learnMore": "हमारे बारे में और जानें",
    
    // CTA Section
    "cta.title": "हमारे समुदाय से जुड़ें",
    "cta.description": "हिमसोल्स परिवार का हिस्सा बनें और सभी के लिए हरित, अधिक टिकाऊ भविष्य बनाने में योगदान दें।",
    "cta.getStarted": "आज ही शुरू करें",
    
    // Footer
    "footer.tagline": "पर्यावरण-अनुकूल पहल और सामुदायिक सशक्तिकरण के माध्यम से टिकाऊ भविष्य का निर्माण।",
    "footer.quickLinks": "त्वरित लिंक",
    "footer.contact": "संपर्क",
    "footer.followUs": "हमें फॉलो करें",
    "footer.rights": "सर्वाधिकार सुरक्षित।",
    
    // Common
    "common.loading": "लोड हो रहा है...",
    "common.submit": "जमा करें",
    "common.cancel": "रद्द करें",
    "common.save": "सहेजें",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.view": "देखें",
    "common.search": "खोजें",
    "common.filter": "फ़िल्टर",
    "common.all": "सभी",
    "common.status": "स्थिति",
    "common.actions": "कार्रवाई",
    "common.name": "नाम",
    "common.fullName": "पूरा नाम",
    "common.email": "ईमेल",
    "common.phone": "फोन",
    "common.phoneNumber": "फोन नंबर",
    "common.address": "पता",
    "common.message": "संदेश",
    "common.date": "तारीख",
    "common.quantity": "मात्रा",
    "common.price": "कीमत",
    "common.total": "कुल",
    "common.state": "राज्य",
    "common.district": "जिला",
    "common.selectState": "राज्य चुनें",
    "common.selectDistrict": "जिला चुनें",
    "common.allCategories": "सभी श्रेणियां",
    "common.showing": "दिखा रहे हैं",
    "common.trees": "पेड़",
    "common.tree": "पेड़",
    "common.inStock": "स्टॉक में",
    "common.onlyLeft": "केवल {count} बचे",
    "common.growth": "वृद्धि",
    "common.height": "ऊंचाई",
    "common.workingHours": "कार्य समय",
    "common.monSat": "सोमवार - शनिवार: सुबह 9:00 - शाम 6:00",
    "common.sunClosed": "रविवार: बंद",
    
    // Tree Plantation Page
    "plantation.title": "वृक्षारोपण कार्यक्रम",
    "plantation.subtitle": "1 मिलियन पेड़ लगाने के हमारे मिशन में शामिल हों। हर पेड़ एक हरित, स्वस्थ ग्रह बनाने में फर्क लाता है।",
    "plantation.requestTitle": "वृक्षारोपण अनुरोध करें",
    "plantation.treeType": "पसंदीदा पेड़ का प्रकार",
    "plantation.selectTreeType": "पेड़ का प्रकार चुनें",
    "plantation.location": "स्थान",
    "plantation.locationPlaceholder": "गांव/शहर, जिला",
    "plantation.numberOfTrees": "पेड़ों की संख्या",
    "plantation.additionalInfo": "अतिरिक्त जानकारी",
    "plantation.additionalPlaceholder": "अपने वृक्षारोपण क्षेत्र के बारे में बताएं, कोई विशेष आवश्यकताएं...",
    "plantation.submitRequest": "अनुरोध जमा करें",
    "plantation.submitting": "जमा हो रहा है...",
    "plantation.requestSuccess": "आपका अनुरोध सफलतापूर्वक जमा हो गया है!",
    "plantation.authRequired": "प्रमाणीकरण आवश्यक",
    "plantation.pleaseLogin": "वृक्षारोपण अनुरोध जमा करने के लिए कृपया लॉगिन करें।",
    "plantation.whyPlant": "पेड़ क्यों लगाएं?",
    "plantation.climateAction": "जलवायु कार्रवाई",
    "plantation.climateDesc": "पेड़ CO2 अवशोषित करते हैं और ऑक्सीजन उत्पन्न करते हैं, जलवायु परिवर्तन से लड़ने में मदद करते हैं",
    "plantation.waterConservation": "जल संरक्षण",
    "plantation.waterDesc": "पेड़ जल चक्र बनाए रखने और मिट्टी के कटाव को रोकने में मदद करते हैं",
    "plantation.biodiversity": "जैव विविधता",
    "plantation.biodiversityDesc": "पेड़ अनगिनत वन्यजीव प्रजातियों के लिए आवास प्रदान करते हैं",
    "plantation.nativeSpecies": "देशी पेड़ की प्रजातियां",
    "plantation.deodar": "देवदार (सीडर)",
    "plantation.deodarDesc": "मूल हिमालयी प्रजाति, उच्च ऊंचाई के लिए उत्कृष्ट",
    "plantation.oak": "ओक (बांज)",
    "plantation.oakDesc": "मजबूत और लंबे समय तक जीवित, वन्यजीवों के लिए बढ़िया",
    "plantation.pine": "पाइन (चीड़)",
    "plantation.pineDesc": "तेजी से बढ़ने वाला, मिट्टी संरक्षण के लिए आदर्श",
    "plantation.rhododendron": "रोडोडेंड्रोन (बुरांश)",
    "plantation.rhododendronDesc": "हिमाचल का राज्य पुष्प, सुंदर फूल",
    "plantation.mixed": "मिश्रित प्रजातियां",
    
    // Shop Page
    "shop.title": "पेड़ खरीदें",
    "shop.subtitle": "देशी पेड़ की प्रजातियों के हमारे संग्रह में से चुनें और एक हरित ग्रह में योगदान दें।",
    "shop.searchPlaceholder": "पेड़ खोजें...",
    "shop.noTrees": "इस समय कोई पेड़ उपलब्ध नहीं है।",
    "shop.noMatch": "आपकी खोज से कोई पेड़ नहीं मिला।",
    "shop.addToCart": "कार्ट में डालें",
    "shop.outOfStock": "स्टॉक में नहीं",
    "shop.addedToCart": "कार्ट में जोड़ा गया",
    "shop.addedToCartDesc": "{name} आपकी कार्ट में जोड़ा गया।",
    
    // Cart
    "cart.title": "शॉपिंग कार्ट",
    "cart.empty": "आपकी कार्ट खाली है",
    "cart.checkout": "चेकआउट करें",
    "cart.deliveryLocation": "डिलीवरी स्थान",
    "cart.notes": "अतिरिक्त नोट्स",
    "cart.placeOrder": "ऑर्डर करें",
    
    // Track Request
    "track.title": "अपना अनुरोध ट्रैक करें",
    "track.enterTrackingId": "अपना ट्रैकिंग आईडी दर्ज करें",
    "track.search": "खोजें",
    "track.noResults": "इस ट्रैकिंग आईडी से कोई अनुरोध नहीं मिला",
    
    // Contact Page
    "contact.title": "संपर्क करें",
    "contact.subtitle": "कोई सवाल है? हम आपसे सुनना चाहेंगे। हमें संदेश भेजें और हम जल्द से जल्द जवाब देंगे।",
    "contact.getInTouch": "संपर्क में रहें",
    "contact.description": "हम आपकी मदद करने और आपके सवालों का जवाब देने के लिए यहां हैं। हम आपसे सुनने के लिए उत्सुक हैं!",
    "contact.subject": "विषय",
    "contact.sendMessage": "संदेश भेजें",
    "contact.sendUsMessage": "हमें संदेश भेजें",
    "contact.tellUsHelp": "बताएं हम कैसे मदद कर सकते हैं...",
    "contact.messageSent": "संदेश भेजा गया!",
    "contact.messageSuccess": "हम 24 घंटे के भीतर आपसे संपर्क करेंगे।",
    
    // Auth
    "auth.login": "लॉगिन",
    "auth.signup": "साइन अप",
    "auth.email": "ईमेल",
    "auth.password": "पासवर्ड",
    "auth.fullName": "पूरा नाम",
    "auth.forgotPassword": "पासवर्ड भूल गए?",
    "auth.noAccount": "खाता नहीं है?",
    "auth.hasAccount": "पहले से खाता है?",
    
    // Waste Management
    "waste.title": "मूल्यवान स्क्रैप संग्रहण",
    "waste.subtitle": "अपनी मूल्यवान स्क्रैप सामग्री के लिए पिकअप शेड्यूल करें",
    "waste.wasteType": "स्क्रैप का प्रकार",
    "waste.pickupDate": "पिकअप तारीख",
    "waste.estimatedQuantity": "अनुमानित मात्रा",
    "waste.requestSuccess": "आपका स्क्रैप संग्रहण अनुरोध जमा हो गया है!",
    
    // Language Toggle
    "language.toggle": "English",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("himsols-language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("himsols-language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
