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
import { caseStudyTagType } from "@/sanity/schemaTypes/caseStudyTag";
import {
  commentPlacementTestType,
  commentPositionType,
} from "@/sanity/schemaTypes/commentPlacementTest";
import { feedPostType } from "@/sanity/schemaTypes/feedPost";
import { feedTagType } from "@/sanity/schemaTypes/feedTag";
import { homePageType } from "@/sanity/schemaTypes/homePage";
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
  caseStudyTagType,
  caseStudyType,
  writingTagType,
  writingType,
  teamTagType,
  teamMemberType,
  feedTagType,
  feedPostType,
  mediaAssetType,
];
