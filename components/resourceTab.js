import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import VersionTab from "./tabs/versionTab";
import { Nav, Placeholder } from "react-bootstrap";
import ReadmeTab from "./tabs/readmeTab";
import ChangelogTab from "./tabs/changelogTab";
import UsageTab from "./tabs/usageTab";
import ParametersTab from "./tabs/parametersTab";
import ExampleTab from "./tabs/exampleTab";
import RawTab from "./tabs/rawTab";

export function createTab(tab) {
  if (!"content" in tab) return null;
  let content = null;
  if (Array.isArray(tab.schema.type)) {
    tab.schema.type = tab.schema.type[0]
  }
  switch (tab.schema.type) {
    case "string":
    case "integer":
    case "boolean":
      content = String(tab.content);
      break;
    case "array":
      content = tab.content.map((item, index) => {
        return (
          <div key={index}>
            {item}
          </div>
        );
      });
      break;
    case "object":
      content = Object.keys(tab.content).map((key, index) => {
        return (
          <div key={index}>
            <div>
              {key}
            </div>
            <div>
              {tab.content[key]}
            </div>
          </div>
        );
      });
      break;
    default:
      content = null;
  }
  return content;
}

/**
 * @component
 * @description The tab component for the resource page. This component is responsible for rendering the tabs and their content.
 * It also handles the routing for the tabs.
 * @param {Object} resource The resource object.
 * @returns {JSX.Element} The JSX element to be rendered.
 */
export default function ResourceTab({ resource, requiredTabs, optionalTabs }) {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("readme");

  const [exampleContent, setExampleContent] = useState([]);
  useEffect(() => {
    async function fetchExampleContent() {
      if (!resource.code_examples) return;
      // convert github url to raw url
      let contents = [];
      for (let example of resource.code_examples) {
        const url = example.example;
        let raw_url = url
          .replace("github.com", "raw.githubusercontent.com")
          .replace("tree/", "");
        let res = await fetch(raw_url);
        let text = await res.text();

        contents.push({
          url: url,
          content: text,
          tested: example.tested,
        });
      }
      setExampleContent(contents);
    }
    fetchExampleContent();
  }, [resource.code_examples]);

  useEffect(() => {
    if (!router.isReady) return;
    let page = router.query.page;
    if (page) {
      page = page[0]
      setSelectedTab(page);
    } else {
      setSelectedTab("readme");
    }
  }, [router.isReady]);

  const handleSelect = (e) => {
    setSelectedTab(e);
    let query = router.query;
    delete query.id;
    delete query.page;
    if (e === "readme") {
      return router.replace({
        pathname: `/resources/${resource.id}`,
        query: {
          ...query,
          database: resource.database,
          version: resource.resource_version,
        }
      }, undefined, {
        shallow: true,
      });
    }
    // replace the tab in the url
    router.replace({
      pathname: `/resources/${resource.id}/${e}`,
      query: {
        ...query,
        database: resource.database,
        version: resource.resource_version,
      }
    }, undefined, {
      shallow: true,
    });
  };

  return Object.keys(resource).length === 0 ? (
    <Placeholder as="div" animation="glow" className="tabs">
      <Placeholder xs={12} />
    </Placeholder>
  ) : (
    <div className="tabs">
      <Tabs
        defaultActiveKey="readme"
        activeKey={selectedTab ?? "readme"}
        onSelect={(e) => handleSelect(e)}
        className="mb-2 main-text-regular"
      >
        <Tab eventKey="readme" title="Readme">
          <ReadmeTab github_url={resource.source_url} />
        </Tab>
        <Tab eventKey="changelog" title="Changelog">
          <ChangelogTab github_url={resource.source_url} />
        </Tab>
        <Tab eventKey="usage" title="Usage">
          <UsageTab
            use={resource.example_usage}
            exampleContent={exampleContent}
            id={resource.id}
          />
        </Tab>
        {resource.arguments ? (
          <Tab eventKey="parameters" title="Parameters">
            <ParametersTab params={resource.arguments} />
          </Tab>
        ) : null}
        {exampleContent.length > 0 ? (
          <Tab eventKey="example" title="Example">
            <ExampleTab exampleContent={exampleContent} />
          </Tab>
        ) : null}
        <Tab eventKey="versions" title="Versions">
          <h3 className="font-weight-light versions-table-title">
            Versions of {resource.id}
          </h3>
          <VersionTab
            id={resource.id}
            database={resource.database}
          />
        </Tab>
        {requiredTabs.map((tab) => {
          let content = createTab(tab);
          if (!content) return null;
          return (
            <Tab eventKey={tab.name} title={tab.name.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")} key={tab.name}>
              <Tab.Container defaultActiveKey="first">
                {content}
              </Tab.Container>
            </Tab>
          );
        })}
        {optionalTabs.length > 0 ? (
          <Tab eventKey="optional" title="Optional">
            <Tab.Container defaultActiveKey="0">
              <Nav variant="pills" className="flex-row">
                {optionalTabs.map((tab, index) => {
                  return (
                    <Nav.Item key={index}>
                      <Nav.Link eventKey={index}>
                        {tab.name}
                      </Nav.Link>
                    </Nav.Item>
                  );
                })}
              </Nav>
              <Tab.Content>
                {optionalTabs.map((tab, index) => {
                  return (
                    <Tab.Pane eventKey={index} key={index}>
                      {createTab(tab)}
                    </Tab.Pane>
                  );
                })}
              </Tab.Content>
            </Tab.Container>
          </Tab>
        ) : null}
        <Tab eventKey="raw" title="Raw">
          <RawTab resource={resource} />
        </Tab>
      </Tabs>
    </div>
  );
}
