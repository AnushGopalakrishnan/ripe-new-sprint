import {
  homeStatType,
  linkType,
  mediaType,
  metricType,
  seoType,
  socialLinkType,
  storySectionType,
  testimonialType,
} from "@/sanity/schemaTypes/objects";
import { caseStudyType } from "@/sanity/schemaTypes/caseStudy";
import { caseStudyLayoutType } from "@/sanity/schemaTypes/caseStudyLayout";
import { caseStudyCommenterType } from "@/sanity/schemaTypes/caseStudyCommenter";
import { caseStudyTagType } from "@/sanity/schemaTypes/caseStudyTag";
import {
  commentPlacementTestType,
  commentPositionType,
} from "@/sanity/schemaTypes/commentPlacementTest";
import { feedPostType } from "@/sanity/schemaTypes/feedPost";
import { feedTagType } from "@/sanity/schemaTypes/feedTag";
import { homePageType } from "@/sanity/schemaTypes/homePage";
import { jobPostingType } from "@/sanity/schemaTypes/jobPosting";
import { mediaAssetType } from "@/sanity/schemaTypes/mediaAsset";
import { siteSettingsType } from "@/sanity/schemaTypes/siteSettings";
import { teamMemberType } from "@/sanity/schemaTypes/teamMember";
import { teamTagType } from "@/sanity/schemaTypes/teamTag";
import { writingType } from "@/sanity/schemaTypes/writing";
import { writingTagType } from "@/sanity/schemaTypes/writingTag";

export const schemaTypes = [
  seoType,
  linkType,
  socialLinkType,
  mediaType,
  metricType,
  storySectionType,
  homeStatType,
  testimonialType,
  siteSettingsType,
  commentPositionType,
  commentPlacementTestType,
  homePageType,
  caseStudyCommenterType,
  caseStudyLayoutType,
  caseStudyTagType,
  caseStudyType,
  writingTagType,
  writingType,
  teamTagType,
  teamMemberType,
  feedTagType,
  feedPostType,
  jobPostingType,
  mediaAssetType,
];
