# Clean AWS

This tool can be used to clean up AWS environments.

## Usage

If you want to delete all resources from your AWS account, you can just run `clean-aws clean`. This will delete all resources from all regions. You can also limit the tool to certain regions. Before deleting it will ask you to confirm that you indeed want to continue.

If you want to choose the resources to remove, then first run the `clean-aws list` command. Review the list of resources generated and remove the resources you want to keep from the list. Once you're happy to delete the reminder, run `clean-aws clean` passing the path to the resource file.

### List Resources

Running the list command will list all supported resources on an AWS environment. This list can then be used to tell the tool which resources to remove.

```bash
clean-aws list --profile default --region ap-southeast-2
```

### Remove Resources

This command will remove all resources listed in the resource file. If not provided, the tool will delete all resources found.

```bash
clean-aws clean --profile default --resourceFile ./resources.json
```

## Detail

This tool cleans (or plans to clean) the following AWS resources:

### Supported

- CloudFormation stacks
- S3 buckets
- CloudWatch logs
- DataPipeline
- DynamoDB tables
- EC2 Instances
- IAM Roles
- IAM Policies
- IAM Users
- SNS Topics
- SNS Topic Subscriptions
- SQS Queues

### Planned

- ELBs
- ES domains
- Route53 resources
- ElasticBeanstalk Applications
- ElasticBeanstalk Environments

## Use as a Library

This package can also be used as a library.

`TODO: Provide example`

## License

MIT
