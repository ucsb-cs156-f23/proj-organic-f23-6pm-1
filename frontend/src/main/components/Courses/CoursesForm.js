import { Button, Form, Row, Col} from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

function CoursesForm({ initialContents, submitAction, buttonLabel = "Create" }) {

    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm(
        { defaultValues: initialContents || {}, }
    );
    // Stryker restore all

    const navigate = useNavigate();

    const testIdPrefix = "CoursesForm";

    return (
        <Form onSubmit={handleSubmit(submitAction)}>
            <Row>
                <Col>
                    {initialContents && (
                        <Form.Group className="mb-3" >
                            <Form.Label htmlFor="id">Id</Form.Label>
                            <Form.Control
                                data-testid={testIdPrefix + "-id"}
                                id="id"
                                type="text"
                                {...register("id")}
                                value={initialContents.id}
                                disabled
                            />
                        </Form.Group>
                    )}
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="name">Name</Form.Label>
                        <Form.Control
                            data-testid={testIdPrefix + "-name"}
                            id="name"
                            type="text"
                            isInvalid={Boolean(errors.name)}
                            {...register("name", {
                                required: "Name is required.",
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.name?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="school">School</Form.Label>
                        <Form.Control
                            data-testid={testIdPrefix + "-school"}
                            id="school"
                            type="text"
                            isInvalid={Boolean(errors.school)}
                            {...register("school", {
                                required: "School is required."
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.school?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="term">Term</Form.Label>
                        <Form.Control
                            data-testid={testIdPrefix + "-term"}
                            id="term"
                            type="text"
                            isInvalid={Boolean(errors.term)}
                            {...register("term", {
                                required: "Term is required."
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.term?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                            <Form.Label htmlFor="startDate">Start (iso format)</Form.Label>
                            <Form.Control
                                data-testid={testIdPrefix + "-startDate"}
                                id="startDate"
                                type="datetime-local"
                                isInvalid={Boolean(errors.startDate)}
                                {...register("startDate", { 
                                    required: "StartDate is required." 
                                })}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.startDate?.message}
                            </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group className="mb-3" >
                            <Form.Label htmlFor="endDate">End (iso format)</Form.Label>
                            <Form.Control
                                data-testid={testIdPrefix + "-endDate"}
                                id="endDate"
                                type="datetime-local"
                                isInvalid={Boolean(errors.endDate)}
                                {...register("endDate", { 
                                    required: "EndDate is required." 
                                })}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.endDate?.message}
                            </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Form.Group className="mb-3" >
                        <Form.Label htmlFor="githubOrg">GithubOrg</Form.Label>
                        <Form.Control
                            data-testid={testIdPrefix + "-githubOrg"}
                            id="githubOrg"
                            type="text"
                            isInvalid={Boolean(errors.githubOrg)}
                            {...register("githubOrg", {
                                required: "GithubOrg is required."
                            })}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.githubOrg?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        type="submit"
                        data-testid={testIdPrefix + "-submit"}
                    >
                        {buttonLabel}
                    </Button>
                    <Button
                        variant="Secondary"
                        onClick={() => navigate(-1)}
                        data-testid={testIdPrefix + "-cancel"}
                    >
                        Cancel
                    </Button>
                </Col>
            </Row>
        </Form>
    )
}

export default CoursesForm;
