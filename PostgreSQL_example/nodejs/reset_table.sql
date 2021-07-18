DROP TABLE IF EXISTS issue;
DROP TABLE IF EXISTS member;

CREATE TABLE member (
    member_id               serial PRIMARY KEY,
    member_name             VARCHAR ( 30 ) NOT NULL
);

CREATE TABLE issue (
    issue_id             serial PRIMARY KEY,
    issue_name           VARCHAR ( 50 ) NOT NULL,
    issue_description    VARCHAR ( 255 ),
    member_id            INT ,
    FOREIGN KEY (member_id)
        REFERENCES member (member_id)
);

INSERT INTO member (member_name) VALUES
    ('Vivien'), 
    ('Aria'), 
    ('Paul'), 
    ('Anne');

INSERT INTO issue (issue_name, issue_description, member_id) VALUES
    ('Bad UI Display', 'In contact view, the text "click here" is not aligned.', 1), 
    ('Bad translation', 'Description 2', 2), 
    ('Issue Name num 3', 'Description Issue 3', 3);


