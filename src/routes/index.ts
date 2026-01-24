import { Router } from "express";

import faqRoutes from "./faq.routes";
import mediaRoutes from "./media_spotlight.routes";
import mentorRoutes from "./mentor.routes";
import leadRoutes from "./lead.routes";
import testimonialRoutes from "./student_testimonial.routes";
import universityRoutes from "./universities/university.routes";
import userRoutes from "./auth.routes";
import adminUserRoutes from "./user.routes";

// New courses module routes
import domainRoutes from "./courses/domain.routes";
import courseRoutes from "./courses/course.routes";
import specializationRoutes from "./courses/specialization.routes";
import universityApprovalsRoutes from "./universities/university_approval.routes";
import placementPartnerRoutes from "./universities/placement-partner.routes";
import emiPartnerRoutes from "./universities/emi-partner.routes";
import universityCourseRoutes from "./universities/university_course.routes";
import universitySpecializationRoutes from "./universities/university_specialization.routes";
import universityCourseSpecializationRoutes from "./universities/university_course_specialization.routes";
import feeTypeRoutes from "./universities/fee_type.routes";
import universityFaqRoutes from "./university_faq.routes";
import universityCourseFaqRoutes from "./university_course_faq.routes";
import universityCourseSpecializationFaqRoutes from "./university_course_specialization_faq.routes";
import universityTypesRoutes from "./universities/university_types.routes";
import courseFaqRoutes from "./courses/course_faq.routes";
import specializationFaqRoutes from "./courses/specialization_faq.routes";
import courseImageRoutes from "./courses/course_image.routes";
import specializationImageRoutes from "./courses/specialization_image.routes";
import stateRoutes from "./location/state.routes";
import cityRoutes from "./location/city.routes";
import searchRoutes from "./search.routes";
import websiteLeadRoutes from "./website_lead.routes";
import contactUsRoutes from "./contact_us.routes";
import dashboardRoutes from "./dashboard/dashboard.routes";
import blogCategoryRoutes from "./blogs/blog_category.routes";
import blogRoutes from "./blogs/blog.routes";
import blogFaqRoutes from "./blogs/blog_faq.routes";
import authorRoutes from "./author.routes";
import homeBannerRoutes from "./home_banner.routes";
// import universitySectionRoute from "./universities/university_section.routes";

const router = Router();

// ✅ CMS grouped routes
router.use("/cms/faqs", faqRoutes);
router.use("/cms/media-spotlight", mediaRoutes);
router.use("/cms/mentors", mentorRoutes);
router.use("/cms/student-testimonials", testimonialRoutes);
router.use("/cms/leads", leadRoutes);
// ✅ IMPORTANT: More specific routes must come BEFORE general routes
router.use("/cms/universities/faqs", universityFaqRoutes);
router.use("/cms/universities/types", universityTypesRoutes);
router.use("/cms/university-courses/faqs", universityCourseFaqRoutes);
router.use("/cms/university-course-specializations/faqs", universityCourseSpecializationFaqRoutes);
router.use("/cms/universities-approvals", universityApprovalsRoutes);
router.use("/cms/placement-partners", placementPartnerRoutes);
router.use("/cms/emi-partners", emiPartnerRoutes);
router.use("/cms/university-specializations", universitySpecializationRoutes);
router.use("/cms/university-course-specializations", universityCourseSpecializationRoutes);
router.use("/cms/university-courses", universityCourseRoutes);
router.use("/cms/fee-types", feeTypeRoutes);
router.use("/cms/universities", universityRoutes);
// router.use("/cms/universities-section", universitySectionRoute);
router.use("/cms/users", userRoutes);
router.use("/cms/admin/users", adminUserRoutes);

// ✅ Courses module routes
router.use("/cms/domains", domainRoutes);
router.use("/cms/courses", courseRoutes);
router.use("/cms/courses/faqs", courseFaqRoutes);
router.use("/cms/course-images", courseImageRoutes);
router.use("/cms/specialization-images", specializationImageRoutes);
router.use("/cms/specializations", specializationRoutes);
router.use("/cms/specializations/faqs", specializationFaqRoutes);

// ✅ Location module routes (States & Cities)
router.use("/cms/states", stateRoutes);
router.use("/cms/cities", cityRoutes);

// ✅ Unified Search route (must come after all other routes to avoid conflicts)
router.use("/cms/search", searchRoutes);

// ✅ Public website leads capture
router.use("/cms/website/leads", websiteLeadRoutes);

// ✅ Contact Us routes
router.use("/cms/contact-us", contactUsRoutes);

// ✅ Dashboard routes
router.use("/cms/dashboard", dashboardRoutes);

// ✅ Blog routes
router.use("/cms/blog-categories", blogCategoryRoutes);
router.use("/cms/blogs", blogRoutes);
router.use("/cms/blogs/faqs", blogFaqRoutes);

// ✅ Author routes
router.use("/cms/authors", authorRoutes);

// ✅ Home Banner routes
router.use("/cms/home-banners", homeBannerRoutes);

export default router;
