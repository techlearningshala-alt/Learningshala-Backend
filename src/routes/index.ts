import { Router } from "express";

import faqRoutes from "./faq.routes";
import mediaRoutes from "./media_spotlight.routes";
import mentorRoutes from "./mentor.routes";
import testimonialRoutes from "./student_testimonial.routes";
import universityRoutes from "./universities/university.routes";
import userRoutes from "./auth.routes";

// New courses module routes
import domainRoutes from "./courses/domain.routes";
import courseRoutes from "./courses/course.routes";
import specializationRoutes from "./courses/specialization.routes";
import universityApprovalsRoutes from "./universities/university_approval.routes";
import placementPartnerRoutes from "./universities/placement-partner.routes";
import emiPartnerRoutes from "./universities/emi-partner.routes";
// import universitySectionRoute from "./universities/university_section.routes";

const router = Router();

// ✅ CMS grouped routes
router.use("/cms/faqs", faqRoutes);
router.use("/cms/media-spotlight", mediaRoutes);
router.use("/cms/mentors", mentorRoutes);
router.use("/cms/student-testimonials", testimonialRoutes);
router.use("/cms/universities", universityRoutes);
router.use("/cms/universities-approvals", universityApprovalsRoutes);
router.use("/cms/placement-partners", placementPartnerRoutes);
router.use("/cms/emi-partners", emiPartnerRoutes);
// router.use("/cms/universities-section", universitySectionRoute);
router.use("/cms/users", userRoutes);

// ✅ Courses module routes
router.use("/cms/domains", domainRoutes);
router.use("/cms/courses", courseRoutes);
router.use("/cms/specializations", specializationRoutes);

export default router;
