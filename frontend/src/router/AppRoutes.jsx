import { DashboardPage } from "../pages/DashboardPage";
import { Portfolio } from "../pages/portfolio/portfolio";
import { Category } from "../pages/category/Category";
import { LoginPage } from "../pages/authentication/LoginPage";
import { Navigate, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicOnlyRoute } from "./PublicOnlyRoute";
import { SubCategory } from "../pages/sub-category/SubCategory";
import { Clients } from "../pages/clients/Clients";
import { Testimonials } from "../pages/testimonials/Testimonials";
import { News } from "../pages/news/News";
import { Blogs } from "../pages/blogs/Blogs";
import { CaseStudies } from "../pages/case-studies/CaseStudies";
import { Career } from "../pages/careers/Career";

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/categories" element={<Category />} />
        <Route path="/sub-categories" element={<SubCategory />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/news" element={<News />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/case-studies" element={<CaseStudies />} />
        <Route path="/careers" element={<Career />} />
      </Route>

      <Route path="/404" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
export default AppRoutes;
