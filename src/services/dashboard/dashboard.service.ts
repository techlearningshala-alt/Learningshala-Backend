import pool from "../../config/db";

export interface DashboardStatistics {
  leads: number;
  websiteLeads: number;
  contactUs: number;
  universities: number;
  universityCourses: number;
  universityCourseSpecializations: number;
  courses: number;
  specializations: number;
  mentors: number;
  testimonials: number;
  mediaSpotlight: number;
  placementPartners: number;
  emiPartners: number;
  domains: number;
  faqs: number;
  universityFaqs: number;
  universityCourseFaqs: number;
  universityCourseSpecializationFaqs: number;
  courseFaqs: number;
  specializationFaqs: number;
  pendingUniversityApprovals?: number;
}

export interface RecentActivity {
  recentLeads: any[];
  recentWebsiteLeads: any[];
  recentContactMessages: any[];
  recentUniversities: any[];
  recentCourses: any[];
}

export interface DashboardData {
  statistics: DashboardStatistics;
  recentActivity: RecentActivity;
  todayStats: {
    leadsToday: number;
    websiteLeadsToday: number;
    contactMessagesToday: number;
  };
  weekStats: {
    leadsThisWeek: number;
    websiteLeadsThisWeek: number;
    contactMessagesThisWeek: number;
  };
}

export class DashboardService {
  /**
   * Get all dashboard statistics
   * @param userRole - User role to filter data (admin sees all, lead sees only leads, others don't see leads)
   */
  static async getStatistics(userRole?: string): Promise<DashboardStatistics> {
    try {
      const isAdmin = userRole === "admin";
      const isLead = userRole === "lead";
      
      // Execute all count queries in parallel for better performance
      // Only fetch lead-related data if user is admin or lead
      const queries: Promise<any>[] = [];
      
      if (isAdmin || isLead) {
        queries.push(
          pool.query("SELECT COUNT(*) as count FROM leads"),
          pool.query("SELECT COUNT(*) as count FROM website_leads"),
          pool.query("SELECT COUNT(*) as count FROM contact_us")
        );
      } else {
        // For non-admin and non-lead users, set leads to 0
        queries.push(
          Promise.resolve([[{ count: 0 }]]),
          Promise.resolve([[{ count: 0 }]]),
          Promise.resolve([[{ count: 0 }]])
        );
      }
      
      // For lead role, set all non-lead stats to 0, otherwise fetch them
      const nonLeadQueries: Promise<any>[] = [];
      if (isLead) {
        // For lead role, set all non-lead stats to 0
        nonLeadQueries.push(
          Promise.resolve([[{ count: 0 }]]), // universities
          Promise.resolve([[{ count: 0 }]]), // universityCourses
          Promise.resolve([[{ count: 0 }]]), // universityCourseSpecializations
          Promise.resolve([[{ count: 0 }]]), // courses
          Promise.resolve([[{ count: 0 }]]), // specializations
          Promise.resolve([[{ count: 0 }]]), // mentors
          Promise.resolve([[{ count: 0 }]]), // testimonials
          Promise.resolve([[{ count: 0 }]]), // mediaSpotlight
          Promise.resolve([[{ count: 0 }]]), // placementPartners
          Promise.resolve([[{ count: 0 }]]), // emiPartners
          Promise.resolve([[{ count: 0 }]]), // domains
          Promise.resolve([[{ count: 0 }]]), // faqs
          Promise.resolve([[{ count: 0 }]]), // universityFaqs
          Promise.resolve([[{ count: 0 }]]), // universityCourseFaqs
          Promise.resolve([[{ count: 0 }]]), // universityCourseSpecializationFaqs
          Promise.resolve([[{ count: 0 }]]), // courseFaqs
          Promise.resolve([[{ count: 0 }]])  // specializationFaqs
        );
      } else {
        // For admin and other roles, fetch all non-lead stats
        nonLeadQueries.push(
          pool.query("SELECT COUNT(*) as count FROM universities WHERE is_active = 1"),
          pool.query("SELECT COUNT(*) as count FROM university_courses WHERE is_active = 1"),
          pool.query("SELECT COUNT(*) as count FROM university_course_specialization WHERE is_active = 1"),
          pool.query("SELECT COUNT(*) as count FROM courses WHERE is_active = 1"),
          pool.query("SELECT COUNT(*) as count FROM specializations WHERE is_active = 1"),
          pool.query("SELECT COUNT(*) as count FROM mentors"),
          pool.query("SELECT COUNT(*) as count FROM student_testimonials"),
          pool.query("SELECT COUNT(*) as count FROM media_spotlight"),
          pool.query("SELECT COUNT(*) as count FROM placement_partners"),
          pool.query("SELECT COUNT(*) as count FROM emi_partners"),
          pool.query("SELECT COUNT(*) as count FROM domains"),
          pool.query("SELECT COUNT(*) as count FROM faqs"),
          pool.query("SELECT COUNT(*) as count FROM university_faqs"),
          pool.query("SELECT COUNT(*) as count FROM university_course_faqs"),
          pool.query("SELECT COUNT(*) as count FROM university_course_specialization_faqs"),
          pool.query("SELECT COUNT(*) as count FROM course_faqs"),
          pool.query("SELECT COUNT(*) as count FROM specialization_faqs")
        );
      }
      
      const [
        leadsResult,
        websiteLeadsResult,
        contactUsResult,
        universitiesResult,
        universityCoursesResult,
        universityCourseSpecializationsResult,
        coursesResult,
        specializationsResult,
        mentorsResult,
        testimonialsResult,
        mediaSpotlightResult,
        placementPartnersResult,
        emiPartnersResult,
        domainsResult,
        faqsResult,
        universityFaqsResult,
        universityCourseFaqsResult,
        universityCourseSpecializationFaqsResult,
        courseFaqsResult,
        specializationFaqsResult,
      ] = await Promise.all([
        ...queries,
        ...nonLeadQueries,
      ]);

      return {
        leads: (leadsResult[0] as any[])[0]?.count || 0,
        websiteLeads: (websiteLeadsResult[0] as any[])[0]?.count || 0,
        contactUs: (contactUsResult[0] as any[])[0]?.count || 0,
        universities: (universitiesResult[0] as any[])[0]?.count || 0,
        universityCourses: (universityCoursesResult[0] as any[])[0]?.count || 0,
        universityCourseSpecializations: (universityCourseSpecializationsResult[0] as any[])[0]?.count || 0,
        courses: (coursesResult[0] as any[])[0]?.count || 0,
        specializations: (specializationsResult[0] as any[])[0]?.count || 0,
        mentors: (mentorsResult[0] as any[])[0]?.count || 0,
        testimonials: (testimonialsResult[0] as any[])[0]?.count || 0,
        mediaSpotlight: (mediaSpotlightResult[0] as any[])[0]?.count || 0,
        placementPartners: (placementPartnersResult[0] as any[])[0]?.count || 0,
        emiPartners: (emiPartnersResult[0] as any[])[0]?.count || 0,
        domains: (domainsResult[0] as any[])[0]?.count || 0,
        faqs: (faqsResult[0] as any[])[0]?.count || 0,
        universityFaqs: (universityFaqsResult[0] as any[])[0]?.count || 0,
        universityCourseFaqs: (universityCourseFaqsResult[0] as any[])[0]?.count || 0,
        universityCourseSpecializationFaqs: (universityCourseSpecializationFaqsResult[0] as any[])[0]?.count || 0,
        courseFaqs: (courseFaqsResult[0] as any[])[0]?.count || 0,
        specializationFaqs: (specializationFaqsResult[0] as any[])[0]?.count || 0,
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard statistics:", error);
      throw error;
    }
  }

  /**
   * Get recent activity data
   * @param userRole - User role to filter data (admin sees all, lead sees only leads, others don't see leads)
   */
  static async getRecentActivity(userRole?: string): Promise<RecentActivity> {
    try {
      const isAdmin = userRole === "admin";
      const isLead = userRole === "lead";
      
      // Only fetch lead-related data if user is admin or lead
      const leadQueries: Promise<any>[] = [];
      if (isAdmin || isLead) {
        leadQueries.push(
          pool.query(
            `SELECT id, name, phone, course, created_on as created_at 
             FROM leads 
             ORDER BY created_on DESC 
             LIMIT 10`
          ),
          pool.query(
            `SELECT id, name, phone, course, created_at 
             FROM website_leads 
             ORDER BY created_at DESC 
             LIMIT 10`
          ),
          pool.query(
            `SELECT id, name, email, phone, created_at 
             FROM contact_us 
             ORDER BY created_at DESC 
             LIMIT 10`
          )
        );
      } else {
        // For non-admin and non-lead users, return empty arrays
        leadQueries.push(
          Promise.resolve([[]]),
          Promise.resolve([[]]),
          Promise.resolve([[]])
        );
      }
      
      // For lead role, set non-lead recent activity to empty arrays
      const nonLeadQueries: Promise<any>[] = [];
      if (isLead) {
        nonLeadQueries.push(
          Promise.resolve([[]]), // recentUniversities
          Promise.resolve([[]])  // recentCourses
        );
      } else {
        // For admin and other roles, fetch non-lead recent activity
        nonLeadQueries.push(
          pool.query(
            `SELECT id, university_name as name, created_at 
             FROM universities 
             WHERE is_active = 1 
             ORDER BY created_at DESC 
             LIMIT 10`
          ),
          pool.query(
            `SELECT id, name, created_at 
             FROM university_courses 
             WHERE is_active = 1 
             ORDER BY created_at DESC 
             LIMIT 10`
          )
        );
      }
      
      const [recentLeads, recentWebsiteLeads, recentContactMessages, recentUniversities, recentCourses] = await Promise.all([
        ...leadQueries,
        ...nonLeadQueries,
      ]);

      return {
        recentLeads: recentLeads[0] as any[],
        recentWebsiteLeads: recentWebsiteLeads[0] as any[],
        recentContactMessages: recentContactMessages[0] as any[],
        recentUniversities: recentUniversities[0] as any[],
        recentCourses: recentCourses[0] as any[],
      };
    } catch (error) {
      console.error("❌ Error fetching recent activity:", error);
      throw error;
    }
  }

  /**
   * Get today's statistics
   * @param userRole - User role to filter data (admin sees all, lead sees only leads, others don't see leads)
   */
  static async getTodayStats(userRole?: string) {
    try {
      const isAdmin = userRole === "admin";
      const isLead = userRole === "lead";
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      let leadsToday, websiteLeadsToday, contactMessagesToday;
      
      if (isAdmin || isLead) {
        [leadsToday, websiteLeadsToday, contactMessagesToday] = await Promise.all([
          pool.query(
            `SELECT COUNT(*) as count FROM leads WHERE DATE(created_on) = ?`,
            [today]
          ),
          pool.query(
            `SELECT COUNT(*) as count FROM website_leads WHERE DATE(created_at) = ?`,
            [today]
          ),
          pool.query(
            `SELECT COUNT(*) as count FROM contact_us WHERE DATE(created_at) = ?`,
            [today]
          ),
        ]);
      } else {
        // For non-admin and non-lead users, set all to 0
        leadsToday = [[{ count: 0 }]];
        websiteLeadsToday = [[{ count: 0 }]];
        contactMessagesToday = [[{ count: 0 }]];
      }

      return {
        leadsToday: (leadsToday[0] as any[])[0]?.count || 0,
        websiteLeadsToday: (websiteLeadsToday[0] as any[])[0]?.count || 0,
        contactMessagesToday: (contactMessagesToday[0] as any[])[0]?.count || 0,
      };
    } catch (error) {
      console.error("❌ Error fetching today's stats:", error);
      throw error;
    }
  }

  /**
   * Get this week's statistics
   * @param userRole - User role to filter data (admin sees all, lead sees only leads, others don't see leads)
   */
  static async getWeekStats(userRole?: string) {
    try {
      const isAdmin = userRole === "admin";
      const isLead = userRole === "lead";
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

      let leadsThisWeek, websiteLeadsThisWeek, contactMessagesThisWeek;
      
      if (isAdmin || isLead) {
        [leadsThisWeek, websiteLeadsThisWeek, contactMessagesThisWeek] = await Promise.all([
          pool.query(
            `SELECT COUNT(*) as count FROM leads WHERE DATE(created_on) >= ?`,
            [weekAgoStr]
          ),
          pool.query(
            `SELECT COUNT(*) as count FROM website_leads WHERE DATE(created_at) >= ?`,
            [weekAgoStr]
          ),
          pool.query(
            `SELECT COUNT(*) as count FROM contact_us WHERE DATE(created_at) >= ?`,
            [weekAgoStr]
          ),
        ]);
      } else {
        // For non-admin and non-lead users, set all to 0
        leadsThisWeek = [[{ count: 0 }]];
        websiteLeadsThisWeek = [[{ count: 0 }]];
        contactMessagesThisWeek = [[{ count: 0 }]];
      }

      return {
        leadsThisWeek: (leadsThisWeek[0] as any[])[0]?.count || 0,
        websiteLeadsThisWeek: (websiteLeadsThisWeek[0] as any[])[0]?.count || 0,
        contactMessagesThisWeek: (contactMessagesThisWeek[0] as any[])[0]?.count || 0,
      };
    } catch (error) {
      console.error("❌ Error fetching week's stats:", error);
      throw error;
    }
  }

  /**
   * Get complete dashboard data
   * @param userRole - User role to filter data (admin sees all, others don't see leads)
   */
  static async getDashboardData(userRole?: string): Promise<DashboardData> {
    try {
      const [statistics, recentActivity, todayStats, weekStats] = await Promise.all([
        this.getStatistics(userRole),
        this.getRecentActivity(userRole),
        this.getTodayStats(userRole),
        this.getWeekStats(userRole),
      ]);

      return {
        statistics,
        recentActivity,
        todayStats,
        weekStats,
      };
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
      throw error;
    }
  }
}

