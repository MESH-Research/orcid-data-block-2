import { sections, displayPreferences } from "./sections";

export function getItems(type, profile) {
    let records = profile["activities-summary"][type];
    let items;
    switch (sections[type].format) {
        case "affiliation-group":
            items = records["affiliation-group"];
            break;
        case "group":
            items = records.group;
            break;
        case "peer-reviews":
            items = records["peer-review-group"];
            break;
        default:
            return [];
    }
    return items;
}

export function getSortedItems(type, profile) {
    const cat = sections[type];
    const items = getItems(type, profile);
    return items.sort((a, b) => {
        return (
            makeDate(b, cat.summary_name, cat.date_name, cat.format) -
            makeDate(a, cat.summary_name, cat.date_name, cat.format)
        );
    });
}

function makeDate(item, summary_name, date_name, format) {
    let dateObj;
    if (format == "affiliation-group") {
        dateObj = item.summaries[0][summary_name][date_name];
    } else if (format === "no-summaries") {
        dateObj = item[summary_name][0][date_name];
    } else if (format == "peer-review") {
        dateObj = item["peer-review-group"][0][summary_name][0][date_name];
    }
    if (dateObj) {
        let year = dateObj.year?.value;
        let month = dateObj.month?.value;
        let day = dateObj.day?.value;
        return new Date(
            year ? year : new Date().getFullYear(),
            month ? month - 1 : 6,
            day ? day : 1,
        );
    } else {
        return new Date();
    }
}

function processRecordDistinction(record) {
    let data = record?.summaries[0]?.[sections.distinctions.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        date: data["start-date"],
        department: data["department-name"],
        end_date: data["end-date"],
        organization: data.organization.name,
        path: data.path,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

function processRecordWork(record) {
    let data = record?.[sections.works.summary_name][0];
    if (!data) {
        return {};
    }
    return {
        display_label: data.title.title.value,
        ["journal-title"]: data["journal-title"]?.value,
        date: data["publication-date"],
        doi_url:
            data["external-ids"]?.["external-id"][0]?.["external-id-url"]
                ?.value,
        path: data.path,
        source: data.source["source-name"]?.value,
        subtitle: data.title.subtitle?.value,
        title: data.title.title.value,
        type: data?.type,
    };
}

function processRecordEducation(record) {
    let data = record?.summaries[0]?.[sections.educations.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data.organization.name,
        path: data.path,
        degree: data?.["role-title"],
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        start_date: data["start-date"],
    };
}

function processRecordEmployment(record) {
    let data = record?.summaries[0]?.[sections.employments.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        path: data.path,
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

function processRecordFunding(record) {
    let data = record?.[sections.fundings.summary_name][0];
    if (!data) {
        return {};
    }
    return {
        display_label: data.title.title.value,
        path: data.path,
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        title: data.title.title.value,
        start_date: data["start-date"],
    };
}

function processRecordInvitedPositions(record) {
    let data =
        record?.summaries[0]?.[sections["invited-positions"].summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        path: data.path,
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

function processRecordPeerReviews(record) {
    let data =
        record?.["peer-review-group"][0][
            sections["peer-reviews"].summary_name
        ][0];
    if (!data) {
        return {};
    }
    return {
        display_label: data["convening-organization"].name,
        path: data.path,
        end_date: data["completion-date"],
        address: data["convening-organization"].address,
        organization: data["convening-organization"].name,
        role: data["reviewer-role"],
    };
}

function processRecordQualifications(record) {
    let data = record?.summaries[0]?.[sections.qualifications.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        path: data.path,
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

function processRecordMemberships(record) {
    let data = record?.summaries[0]?.[sections.memberships.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        path: data.path,
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

function processRecordService(record) {
    let data = record?.summaries[0]?.[sections.services.summary_name];
    if (!data) {
        return {};
    }
    return {
        display_label: data["role-title"],
        path: data.path,
        department_name: data["department-name"],
        end_date: data["end-date"],
        address: data.organization.address,
        organization: data.organization.name,
        role: data["role-title"],
        start_date: data["start-date"],
    };
}

export function getProcessedData(profile) {
    let a = Object.keys(sections)
    let o = {};
    a.map((item) => {
        let sorted = getSortedItems(item, profile);
        o[item] = sorted;
    });
    if (o?.distinctions) {
        let d = o.distinctions.map((item) => {
            return processRecordDistinction(item);
        });
        o.distinctions = d;
    }
    if (o?.educations) {
        let ed = o.educations.map((item) => {
            return processRecordEducation(item);
        });
        o.educations = ed;
    }
    if (o?.employments) {
        let em = o.employments.map((item) => {
            return processRecordEmployment(item);
        });
        o.employments = em;
    }
    if (o?.fundings) {
        let f = o.fundings.map((item) => {
            return processRecordFunding(item);
        });
        o.fundings = f;
    }
    if (o?.["invited-positions"]) {
        let inv = o["invited-positions"].map((item) => {
            return processRecordInvitedPositions(item);
        });
        o["invited-positions"] = inv;
    }
    if (o?.memberships) {
        let mem = o.memberships.map((item) => {
            return processRecordMemberships(item);
        });
        o.memberships = mem;
    }
    if (o?.["peer-reviews"]) {
        let pr = o["peer-reviews"].map((item) => {
            return processRecordPeerReviews(item);
        });
        o["peer-reviews"] = pr;
    }
    if (o?.qualifications) {
        let q = o.qualifications.map((item) => {
            return processRecordQualifications(item);
        });
        o.qualifications = q;
    }
    if (o?.services) {
        let s = o.services.map((item) => {
            return processRecordService(item);
        });
        o.services = s;
    }
    if (o?.works) {
        let w = o.works.map((item) => {
            return processRecordWork(item);
        });
        o.works = w;
    }
    return o;
}